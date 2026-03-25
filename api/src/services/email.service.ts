import { HttpException, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fs from 'fs';
import Handlebars from 'handlebars';
import Polyglot from 'node-polyglot';
import path from 'path';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import tz from 'dayjs/plugin/timezone';
import advanced from 'dayjs/plugin/advancedFormat';
import { LanguagesEnum, ReviewOrderTypeEnum } from '@prisma/client';
import { ErrorResponse, Resend } from 'resend';
import { JurisdictionService } from './jurisdiction.service';
import { TranslationService } from './translation.service';
import { Application } from '../dtos/applications/application.dto';
import { Jurisdiction } from '../dtos/jurisdictions/jurisdiction.dto';
import { Listing } from '../dtos/listings/listing.dto';
import { IdDTO } from '../dtos/shared/id.dto';
import { User } from '../dtos/users/user.dto';
import { FeatureFlagEnum } from '../enums/feature-flags/feature-flags-enum';
import {
  BatchHtmlEmailPayload,
  BatchEmailResponse,
  EmailAttachmentData,
  HtmlEmailPayload,
  SingleEmailResponse,
} from '../types/email';
import { doJurisdictionHaveFeatureFlagSet } from '../utilities/feature-flag-utilities';
import { getPublicEmailURL } from '../utilities/get-public-email-url';
import type { ApplicationStatusChangeItem } from '../utilities/applicationStatusChanges';
dayjs.extend(utc);
dayjs.extend(tz);
dayjs.extend(advanced);

type listingInfo = {
  id: string;
  name: string;
  juris: string;
};

@Injectable()
export class EmailService {
  polyglot: Polyglot;
  private readonly resend: Resend;
  private readonly resendRetryBaseDelayMs = 1000;

  constructor(
    configService: ConfigService,
    private readonly translationService: TranslationService,
    private readonly jurisdictionService: JurisdictionService,
    @Inject(Logger)
    private logger = new Logger(EmailService.name),
  ) {
    this.resend = new Resend(configService.get<string>('EMAIL_API_KEY'));
    this.polyglot = new Polyglot({
      phrases: {},
    });
    const polyglot = this.polyglot;
    Handlebars.registerHelper(
      't',
      function (
        phrase: string,
        options?: number | Polyglot.InterpolationOptions,
      ) {
        return polyglot.t(phrase, options);
      },
    );
    Handlebars.registerHelper('or', function (...args) {
      // Remove the last argument (Handlebars options object)
      args.pop();
      return args.some((arg) => arg);
    });
    const parts = this.partials();
    Handlebars.registerPartial(parts);
  }

  private template(view: string) {
    return Handlebars.compile(
      fs.readFileSync(
        path.join(path.resolve(__dirname, '..', 'views'), `/${view}.hbs`),
        'utf8',
      ),
    );
  }

  private partial(view: string) {
    return fs.readFileSync(
      path.join(path.resolve(__dirname, '..', 'views'), `/${view}`),
      'utf8',
    );
  }

  private partials() {
    const partials = {};
    const dirName = path.resolve(__dirname, '..', 'views/partials');

    fs.readdirSync(dirName).forEach((filename) => {
      partials[filename.slice(0, -4)] = this.partial('partials/' + filename);
    });

    const layoutsDirName = path.resolve(__dirname, '..', 'views/layouts');

    fs.readdirSync(layoutsDirName).forEach((filename) => {
      partials[`layout_${filename.slice(0, -4)}`] = this.partial(
        'layouts/' + filename,
      );
    });

    return partials;
  }

  /**
   * Sends an email to one or more recipients. Array recipients are dispatched
   * via the Resend batch API for fewer round-trips; attachments force a
   * per-recipient fallback because the batch endpoint does not support them.
   *
   * @param to - A single email address or an array of addresses.
   * @param from - The sender address (e.g. "App Name <no-reply@domain>").
   * @param subject - The email subject line.
   * @param body - The rendered HTML body.
   * @param retry - Number of retry attempts (default 3).
   * @param attachment - Optional file attachment (forces per-recipient sends).
   */
  private async send(
    to: string | string[],
    from: string,
    subject: string,
    body: string,
    retry = 3,
    attachment?: EmailAttachmentData,
  ) {
    if (!Array.isArray(to)) {
      await this.sendSingle(to, from, subject, body, retry, attachment);
      return;
    }

    if (to.length === 0) return;

    // If no attachments, we can use the batch API.
    if (!attachment) {
      await this.sendBatch(to, from, subject, body, retry);
      return;
    }

    await Promise.all(
      to.map((recipient) =>
        this.sendSingle(recipient, from, subject, body, retry, attachment),
      ),
    );
  }

  /**
   * Sends identical emails to multiple recipients via the Resend batch API.
   * Automatically chunks into groups of 100 (Resend's per-request limit).
   *
   * @param to - Array of recipient email addresses.
   * @param from - The sender address.
   * @param subject - The email subject line.
   * @param body - The rendered HTML body.
   * @param retry - Number of retry attempts (default 3).
   */
  private async sendBatch(
    to: string[],
    from: string,
    subject: string,
    body: string,
    retry = 3,
  ) {
    const BATCH_LIMIT = 100;
    for (let i = 0; i < to.length; i += BATCH_LIMIT) {
      const chunk = to.slice(i, i + BATCH_LIMIT);
      const payloads: BatchHtmlEmailPayload[] = chunk.map((recipient) => ({
        to: recipient,
        from,
        subject,
        html: body,
      }));
      await this.retrySendWithBackoff(chunk, retry, () =>
        this.resend.batch.send(payloads),
      );
    }
  }

  /**
   * Sends a single Resend email request and retries failed delivery attempts.
   *
   * @param to - The recipient email address.
   * @param from - The sender address.
   * @param subject - The email subject line.
   * @param body - The rendered HTML body.
   * @param retry - Number of retry attempts (default 3).
   * @param attachment - Optional file attachment.
   */
  private async sendSingle(
    to: string,
    from: string,
    subject: string,
    body: string,
    retry = 3,
    attachment?: EmailAttachmentData,
  ) {
    // Build the base HTML payload expected by the Resend SDK.
    const emailParams: HtmlEmailPayload = {
      to,
      from,
      subject,
      html: body,
    };

    // Convert text attachments to a Buffer so binary-safe delivery matches the old transport.
    if (attachment) {
      emailParams.attachments = [
        {
          content: Buffer.from(attachment.data, 'utf8'),
          filename: attachment.name,
          contentType: attachment.type,
        },
      ];
    }
    await this.retrySendWithBackoff(to, retry, () =>
      this.resend.emails.send(emailParams),
    );
  }

  private async retrySendWithBackoff<
    TResponse extends SingleEmailResponse | BatchEmailResponse,
  >(
    to: string | string[],
    retry: number,
    sendRequest: () => Promise<TResponse>,
  ): Promise<TResponse | null> {
    for (let attempt = 0; attempt <= retry; attempt++) {
      const retriesRemaining = retry - attempt;

      try {
        const response = await sendRequest();

        if (!response.error) return response;

        this.logSendFailure(to, response.error, retriesRemaining);

        if (
          retriesRemaining === 0 ||
          !this.shouldRetrySendFailure(response.error)
        ) {
          return null;
        }
      } catch (error) {
        this.logSendFailure(to, error, retriesRemaining);

        if (retriesRemaining === 0) {
          return null;
        }
      }

      await new Promise((resolve) =>
        setTimeout(resolve, this.resendRetryBaseDelayMs * 2 ** attempt),
      );
    }

    return null;
  }

  private shouldRetrySendFailure(error: ErrorResponse | Error | unknown) {
    // Always retry on unknown errors.
    if (!this.isResendErrorResponse(error) || error.statusCode === null) {
      return true;
    }

    return error.statusCode < 400 || error.statusCode >= 500;
  }

  /**
   * Logs a delivery failure with normalized recipient and provider error details.
   *
   * @param to - The recipient address(es) that failed.
   * @param error - The Resend API error, thrown exception, or unknown value.
   * @param retriesRemaining - How many retry attempts are left.
   */
  private logSendFailure(
    to: string | string[],
    error: ErrorResponse | Error | unknown,
    retriesRemaining: number,
  ) {
    // Collapse array recipients into a readable log line.
    const recipients = Array.isArray(to) ? to.join(', ') : to;

    // Normalize the provider error into a single loggable string.
    const errorMessage = this.getSendErrorMessage(error);

    this.logger.error(
      `Error sending email to ${recipients}. Retries remaining: ${retriesRemaining}. ${errorMessage}`,
    );
  }

  /**
   * Converts Resend and runtime errors into a consistent log message format.
   *
   * @param error - The Resend API error, thrown exception, or unknown value.
   * @returns A human-readable error string suitable for logging.
   */
  private getSendErrorMessage(error: ErrorResponse | Error | unknown): string {
    // Prefer structured provider metadata when Resend returns an API error object.
    if (this.isResendErrorResponse(error)) {
      return `${error.name}: ${error.message} (statusCode: ${
        error.statusCode ?? 'unknown'
      })`;
    }

    // Fall back to the native error message for thrown runtime errors.
    if (error instanceof Error) {
      return error.message;
    }

    // Keep logging resilient even for unexpected error shapes.
    return 'Unknown email delivery error';
  }

  /**
   * Detects whether an unknown value matches the Resend API error shape.
   *
   * @param error - The value to check.
   * @returns `true` if the value has `message`, `name`, and `statusCode` properties.
   */
  private isResendErrorResponse(error: unknown): error is ErrorResponse {
    return (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      'name' in error &&
      'statusCode' in error
    );
  }

  // TODO: update this to be memoized based on jurisdiction and language
  // https://github.com/bloom-housing/bloom/issues/3648
  private async loadTranslations(
    jurisdiction: Jurisdiction | null,
    language?: LanguagesEnum,
  ) {
    const translations = await this.translationService.getMergedTranslations(
      jurisdiction?.id,
      language,
    );
    this.polyglot.replace(translations);
  }

  private async getJurisdiction(
    jurisdictionIds: IdDTO[] | null,
    jurisdictionName?: string,
  ): Promise<Jurisdiction | null> {
    // Only return the jurisdiction if there is one jurisdiction passed in.
    // For example if the user is tied to more than one jurisdiction the user should received the generic translations
    if (jurisdictionIds?.length === 1) {
      return await this.jurisdictionService.findOne({
        jurisdictionId: jurisdictionIds[0]?.id,
      });
    } else if (jurisdictionName) {
      return await this.jurisdictionService.findOne({
        jurisdictionName: jurisdictionName,
      });
    }
    return null;
  }

  private async getEmailToSendFrom(
    jurisdictionIds: IdDTO[],
    jurisdiction: Jurisdiction,
  ): Promise<string> {
    if (jurisdiction) {
      return jurisdiction.emailFromAddress;
    }
    // An admin will be attached to more than one jurisdiction so we want generic translations
    // but still need an email to send from
    if (jurisdictionIds.length > 1) {
      const firstJurisdiction = await this.jurisdictionService.findOne({
        jurisdictionId: jurisdictionIds[0].id,
      });
      return firstJurisdiction?.emailFromAddress || '';
    }
    return '';
  }

  /* Send welcome email to new public users */
  public async welcome(
    jurisdictionName: string,
    user: User,
    appUrl: string,
    confirmationUrl: string,
  ) {
    const jurisdiction = await this.getJurisdiction(null, jurisdictionName);
    const baseUrl = appUrl ? new URL(appUrl).origin : undefined;
    await this.loadTranslations(jurisdiction, user.language);
    await this.send(
      user.email,
      jurisdiction.emailFromAddress,
      this.polyglot.t('register.welcome'),
      this.template('register-email')({
        user: user,
        confirmationUrl: confirmationUrl,
        appOptions: { appUrl: baseUrl },
      }),
    );
  }

  /* Send invite email to partner users */
  async invitePartnerUser(
    jurisdictionIds: IdDTO[],
    user: User,
    appUrl: string,
    confirmationUrl: string,
  ) {
    const jurisdiction = await this.getJurisdiction(jurisdictionIds);
    void (await this.loadTranslations(jurisdiction, user.language));
    const emailFromAddress = await this.getEmailToSendFrom(
      jurisdictionIds,
      jurisdiction,
    );
    await this.send(
      user.email,
      emailFromAddress,
      this.polyglot.t('invite.hello'),
      this.template('invite')({
        user: user,
        confirmationUrl: confirmationUrl,
        appOptions: { appUrl },
      }),
    );
  }

  /* send change of email email */
  public async changeEmail(
    jurisdictionName: string,
    user: User,
    appUrl: string,
    confirmationUrl: string,
    newEmail: string,
  ) {
    const jurisdiction = await this.getJurisdiction(null, jurisdictionName);
    await this.loadTranslations(jurisdiction, user.language);
    await this.send(
      newEmail,
      jurisdiction.emailFromAddress,
      this.polyglot.t('changeEmail.message'),
      this.template('change-email')({
        user: user,
        confirmationUrl: confirmationUrl,
        appOptions: { appUrl: appUrl },
      }),
    );
  }

  /* Send forgot password email */
  public async forgotPassword(
    jurisdictionIds: IdDTO[],
    user: User,
    appUrl: string,
    resetToken: string,
  ) {
    const jurisdiction = await this.getJurisdiction(jurisdictionIds);
    void (await this.loadTranslations(jurisdiction, user.language));
    const compiledTemplate = this.template('forgot-password');
    const resetUrl = getPublicEmailURL(appUrl, resetToken, '/reset-password');
    const baseUrl = appUrl ? new URL(appUrl).origin : undefined;
    const emailFromAddress = await this.getEmailToSendFrom(
      jurisdictionIds,
      jurisdiction,
    );

    await this.send(
      user.email,
      emailFromAddress,
      this.polyglot.t('forgotPassword.subject'),
      compiledTemplate({
        resetUrl: resetUrl,
        resetOptions: { appUrl: baseUrl },
        user: user,
      }),
    );
  }

  public async sendMfaCode(user: User, singleUseCode: string) {
    const jurisdiction = await this.getJurisdiction(user.jurisdictions);
    void (await this.loadTranslations(jurisdiction, user.language));
    const emailFromAddress = await this.getEmailToSendFrom(
      user.jurisdictions,
      jurisdiction,
    );
    await this.send(
      user.email,
      emailFromAddress,
      `${singleUseCode} is your secure Partners Portal account access token`,
      this.template('mfa-code')({
        user: user,
        mfaCodeOptions: { singleUseCode },
      }),
    );
  }

  public async sendSingleUseCode(
    user: User,
    singleUseCode: string,
    jurisdictionName?: string,
  ) {
    const jurisdiction = await this.getJurisdiction(
      user.jurisdictions,
      jurisdictionName,
    );
    void (await this.loadTranslations(jurisdiction, user.language));
    const emailFromAddress = await this.getEmailToSendFrom(
      user.jurisdictions,
      jurisdiction,
    );
    await this.send(
      user.email,
      emailFromAddress,
      user.confirmedAt
        ? `${singleUseCode} is your secure ${jurisdiction.name} sign-in code`
        : `${singleUseCode} is your secure ${jurisdiction.name} verification code`,
      this.template('single-use-code')({
        user: user,
        singleUseCodeOptions: {
          singleUseCode,
          jurisdictionName: jurisdiction.name,
        },
      }),
    );
  }

  public async applicationConfirmation(
    listing: Listing,
    application: Application,
    appUrl: string,
  ) {
    const jurisdiction = await this.getJurisdiction([listing.jurisdictions]);
    void (await this.loadTranslations(jurisdiction, application.language));
    const enableUnitGroups = doJurisdictionHaveFeatureFlagSet(
      jurisdiction,
      FeatureFlagEnum.enableUnitGroups,
    );
    const listingUrl = `${appUrl}/listing/${listing.id}`;
    const compiledTemplate = this.template('confirmation');

    let eligibleText: string = null;
    let preferenceText: string = null;
    let contactText: string = null;
    if (enableUnitGroups) {
      const hasUnitGroups = listing.unitGroups?.length > 0;
      const unitsAvailable =
        listing.unitGroups?.length > 0
          ? listing.unitGroups.reduce(
              (acc, curr) => acc + curr.totalAvailable,
              0,
            )
          : listing.unitsAvailable;

      if (listing.reviewOrderType === ReviewOrderTypeEnum.lottery) {
        eligibleText = this.polyglot.t('confirmation.eligible.lottery');
        preferenceText = this.polyglot.t(
          'confirmation.eligible.lotteryPreference',
        );
      } else if (unitsAvailable) {
        eligibleText = this.polyglot.t('confirmation.eligible.fcfs');
        preferenceText = this.polyglot.t(
          'confirmation.eligible.fcfsPreference',
        );
      } else if (hasUnitGroups) {
        if (listing.reviewOrderType === ReviewOrderTypeEnum.waitlistLottery) {
          eligibleText = this.polyglot.t(
            'confirmation.eligible.waitlistLottery',
          );
        } else {
          eligibleText = this.polyglot.t('confirmation.eligible.waitlist');
        }
        contactText = this.polyglot.t('confirmation.eligible.waitlistContact');
        preferenceText = this.polyglot.t(
          'confirmation.eligible.waitlistPreference',
        );
      }
    } else {
      if (listing.reviewOrderType === ReviewOrderTypeEnum.firstComeFirstServe) {
        eligibleText = this.polyglot.t('confirmation.eligible.fcfs');
        preferenceText = this.polyglot.t(
          'confirmation.eligible.fcfsPreference',
        );
      }
      if (listing.reviewOrderType === ReviewOrderTypeEnum.lottery) {
        eligibleText = this.polyglot.t('confirmation.eligible.lottery');
        preferenceText = this.polyglot.t(
          'confirmation.eligible.lotteryPreference',
        );
      }
      if (listing.reviewOrderType === ReviewOrderTypeEnum.waitlist) {
        eligibleText = this.polyglot.t('confirmation.eligible.waitlist');
        contactText = this.polyglot.t('confirmation.eligible.waitlistContact');
        preferenceText = this.polyglot.t(
          'confirmation.eligible.waitlistPreference',
        );
      }
      if (listing.reviewOrderType === ReviewOrderTypeEnum.waitlistLottery) {
        eligibleText = this.polyglot.t('confirmation.eligible.waitlistLottery');
        contactText = this.polyglot.t('confirmation.eligible.waitlistContact');
        preferenceText = this.polyglot.t(
          'confirmation.eligible.waitlistPreference',
        );
      }
    }

    const user = {
      firstName: application.applicant.firstName,
      middleName: application.applicant.middleName,
      lastName: application.applicant.lastName,
    };

    const nextStepsUrl = this.polyglot.t('confirmation.nextStepsUrl');

    await this.send(
      application.applicant.emailAddress,
      jurisdiction.emailFromAddress,
      this.polyglot.t('confirmation.subject'),
      compiledTemplate({
        subject: this.polyglot.t('confirmation.subject'),
        header: {
          logoTitle: this.polyglot.t('header.logoTitle'),
          logoUrl: this.polyglot.t('header.logoUrl'),
        },
        listing,
        listingUrl,
        application,
        preferenceText,
        interviewText: this.polyglot.t('confirmation.interview'),
        eligibleText,
        contactText,
        nextStepsUrl:
          nextStepsUrl != 'confirmation.nextStepsUrl' ? nextStepsUrl : null,
        user,
      }),
    );
  }

  public async applicationUpdateEmail(
    listing: Listing,
    application: Application,
    changes: ApplicationStatusChangeItem[],
    appUrl: string,
    contactEmail?: string,
  ) {
    const jurisdiction = await this.getJurisdiction([listing.jurisdictions]);
    void (await this.loadTranslations(jurisdiction, application.language));

    const summaryItems = changes.map((change) => {
      if (change.type === 'status') {
        const fromLabel = this.polyglot.t(
          `applicationUpdate.applicationStatus.${change.from}`,
        );
        const toLabel = this.polyglot.t(
          `applicationUpdate.applicationStatus.${change.to}`,
        );
        return new Handlebars.SafeString(
          this.polyglot.t('applicationUpdate.statusChange', {
            from: `<strong>${fromLabel}</strong>`,
            to: `<strong>${toLabel}</strong>`,
          }),
        );
      }
      if (change.type === 'accessibleWaitlist') {
        return new Handlebars.SafeString(
          this.polyglot.t('applicationUpdate.accessibleWaitListChange', {
            value: `<strong>${change.value}</strong>`,
          }),
        );
      }
      return new Handlebars.SafeString(
        this.polyglot.t('applicationUpdate.conventionalWaitListChange', {
          value: `<strong>${change.value}</strong>`,
        }),
      );
    });

    const applicantName = [
      application.applicant.firstName,
      application.applicant.lastName,
    ]
      .filter(Boolean)
      .join(' ');
    const subject = this.polyglot.t('applicationUpdate.subject', {
      listingName: listing.name,
    });
    const loginUrl = appUrl ? `${appUrl}/sign-in` : '';

    await this.send(
      application.applicant.emailAddress,
      jurisdiction.emailFromAddress,
      subject,
      this.template('application-update')({
        appOptions: { listingName: listing.name },
        applicantName,
        summaryItems,
        loginUrl,
        contactEmail: contactEmail,
      }),
    );
  }

  public async requestApproval(
    jurisdictionId: IdDTO,
    listingInfo: IdDTO,
    emails: string[],
    appUrl: string,
  ) {
    try {
      const jurisdiction = await this.getJurisdiction([jurisdictionId]);
      void (await this.loadTranslations(jurisdiction));
      this.logger.log(
        `Sending request approval email for listing ${listingInfo.name} to ${emails.length} emails`,
      );
      await this.send(
        emails,
        jurisdiction.emailFromAddress,
        this.polyglot.t('requestApproval.header'),
        this.template('request-approval')({
          appOptions: { listingName: listingInfo.name },
          appUrl: appUrl,
          listingUrl: `${appUrl}/listings/${listingInfo.id}`,
        }),
      );
    } catch (err) {
      console.log('Request approval email failed', err);
      throw new HttpException('email failed', 500);
    }
  }

  public async changesRequested(
    user: User,
    listingInfo: listingInfo,
    emails: string[],
    appUrl: string,
  ) {
    try {
      const jurisdiction = listingInfo.juris
        ? await this.getJurisdiction([{ id: listingInfo.juris }])
        : user.jurisdictions[0];
      void (await this.loadTranslations(jurisdiction));
      this.logger.log(
        `Sending changes requested email for listing ${listingInfo.name} to ${emails.length} emails`,
      );
      await this.send(
        emails,
        jurisdiction.emailFromAddress,
        this.polyglot.t('changesRequested.header'),
        this.template('changes-requested')({
          appOptions: { listingName: listingInfo.name },
          appUrl: appUrl,
          listingUrl: `${appUrl}/listings/${listingInfo.id}`,
        }),
      );
    } catch (err) {
      console.log('changes requested email failed', err);
      throw new HttpException('email failed', 500);
    }
  }

  public async listingApproved(
    jurisdictionId: IdDTO,
    listingInfo: IdDTO,
    emails: string[],
    publicUrl: string,
  ) {
    try {
      const jurisdiction = await this.getJurisdiction([jurisdictionId]);
      void (await this.loadTranslations(jurisdiction));
      this.logger.log(
        `Sending listing approved email for listing ${listingInfo.name} to ${emails.length} emails`,
      );
      await this.send(
        emails,
        jurisdiction.emailFromAddress,
        this.polyglot.t('listingApproved.header'),
        this.template('listing-approved')({
          appOptions: { listingName: listingInfo.name },
          listingUrl: `${publicUrl}/listing/${listingInfo.id}`,
        }),
      );
    } catch (err) {
      console.log('listing approval email failed', err);
      throw new HttpException('email failed', 500);
    }
  }

  public async applicationScriptRunner(
    application: Application,
    jurisdictionId: IdDTO,
  ) {
    const jurisdiction = await this.getJurisdiction([jurisdictionId]);
    void (await this.loadTranslations(jurisdiction, application.language));
    const compiledTemplate = this.template('script-runner');

    const user = {
      firstName: application.applicant.firstName,
      middleName: application.applicant.middleName,
      lastName: application.applicant.lastName,
    };
    await this.send(
      application.applicant.emailAddress,
      jurisdiction.emailFromAddress,
      this.polyglot.t('scriptRunner.subject'),
      compiledTemplate({
        application,
        user,
      }),
    );
  }

  /**
   *
   * @param jurisdictionIds the set of jurisdicitons for the user (sent as IdDTO[]
   * @param user the user that should received the csv export
   * @param csvData the data that makes up the content of the csv to be sent as an attachment
   * @param exportEmailTitle the title of the email ('User Export' is an example)
   * @param exportEmailFileDescription describes what is being sent. Completes the line:
     'The attached file is %{fileDescription}. If you have any questions, please reach out to your administrator.
   */
  async sendCSV(
    jurisdictionIds: IdDTO[],
    user: User,
    csvData: string,
    exportEmailTitle: string,
    exportEmailFileDescription: string,
  ): Promise<void> {
    const jurisdiction = await this.getJurisdiction(jurisdictionIds);
    void (await this.loadTranslations(jurisdiction, user.language));
    const emailFromAddress = await this.getEmailToSendFrom(
      user.jurisdictions,
      jurisdiction,
    );
    await this.send(
      user.email,
      emailFromAddress,
      exportEmailTitle,
      this.template('csv-export')({
        user: user,
        appOptions: {
          title: exportEmailTitle,
          fileDescription: exportEmailFileDescription,
          appUrl: process.env.PARTNERS_PORTAL_URL,
        },
      }),
      undefined,
      {
        data: csvData,
        name: `users-${this.formatLocalDate(
          new Date(),
          'YYYY-MM-DD_HH:mm:ss',
        )}.csv`,
        type: 'text/csv',
      },
    );
  }

  public async lotteryReleased(
    listingInfo: listingInfo,
    emails: string[],
    appUrl: string,
  ) {
    try {
      const jurisdiction = await this.getJurisdiction([
        { id: listingInfo.juris },
      ]);
      void (await this.loadTranslations(jurisdiction));
      this.logger.log(
        `Sending lottery released email for listing ${listingInfo.name} to ${emails.length} emails`,
      );
      await this.send(
        emails,
        jurisdiction.emailFromAddress,
        this.polyglot.t('lotteryReleased.header', {
          listingName: listingInfo.name,
        }),
        this.template('lottery-released')({
          appOptions: { listingName: listingInfo.name },
          appUrl: appUrl,
          listingUrl: `${appUrl}/listings/${listingInfo.id}`,
        }),
      );
    } catch (err) {
      console.log('lottery released email failed', err);
      throw new HttpException('email failed', 500);
    }
  }

  public async lotteryPublishedAdmin(
    listingInfo: listingInfo,
    emails: string[],
    appUrl: string,
  ) {
    try {
      const jurisdiction = await this.getJurisdiction([
        { id: listingInfo.juris },
      ]);
      void (await this.loadTranslations(jurisdiction));
      this.logger.log(
        `Sending lottery published admin email for listing ${listingInfo.name} to ${emails.length} emails`,
      );
      await this.send(
        emails,
        jurisdiction.emailFromAddress,
        this.polyglot.t('lotteryPublished.header', {
          listingName: listingInfo.name,
        }),
        this.template('lottery-published-admin')({
          appOptions: { listingName: listingInfo.name, appUrl: appUrl },
        }),
      );
    } catch (err) {
      console.log('lottery published admin email failed', err);
      throw new HttpException('email failed', 500);
    }
  }

  /**
   *
   * @param emails a key in LanguagesEnum to a list of emails of applicants who submitted in that language
   */
  public async lotteryPublishedApplicant(
    listingInfo: listingInfo,
    emails: { [key: string]: string[] },
  ) {
    try {
      const jurisdiction = await this.getJurisdiction([
        { id: listingInfo.juris },
      ]);

      for (const language in emails) {
        void (await this.loadTranslations(
          jurisdiction,
          language as LanguagesEnum,
        ));
        this.logger.log(
          `Sending lottery published ${language} email for listing ${listingInfo.name} to ${emails[language]?.length} emails`,
        );
        await this.send(
          emails[language],
          jurisdiction.emailFromAddress,
          this.polyglot.t('lotteryAvailable.header', {
            listingName: listingInfo.name,
          }),
          this.template('lottery-published-applicant')({
            appOptions: {
              listingName: listingInfo.name,
              appUrl: jurisdiction.publicUrl,
            },
            signInUrl: `${jurisdiction.publicUrl}/${language}/sign-in`,
            // These two URLs are placeholders and must be updated per jurisdiction
            notificationsUrl: jurisdiction.notificationsSignUpUrl || '',
            helpCenterUrl: jurisdiction.publicUrl || '',
          }),
        );
      }
    } catch (err) {
      console.log('lottery published applicant email failed', err);
      throw new HttpException('email failed', 500);
    }
  }

  public async warnOfAccountRemoval(user: User) {
    const jurisdiction = await this.getJurisdiction(user.jurisdictions);
    void (await this.loadTranslations(jurisdiction, user.language));
    const emailFromAddress = await this.getEmailToSendFrom(
      user.jurisdictions,
      jurisdiction,
    );
    const signInUrl = jurisdiction ? `${jurisdiction.publicUrl}/sign-in` : '';
    await this.send(
      user.email,
      emailFromAddress,
      this.polyglot.t('accountRemoval.subject'),
      this.template('warn-removal')({
        user: user,
        signInUrl: signInUrl,
      }),
    );
  }

  formatLocalDate(rawDate: string | Date, format: string): string {
    const utcDate = dayjs.utc(rawDate);
    return utcDate.format(format);
  }
}
