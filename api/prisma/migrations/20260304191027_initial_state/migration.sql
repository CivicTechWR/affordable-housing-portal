-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateEnum
CREATE TYPE "listings_application_address_type_enum" AS ENUM ('leasingAgent');

-- CreateEnum
CREATE TYPE "application_methods_type_enum" AS ENUM ('Internal', 'FileDownload', 'ExternalLink', 'PaperPickup', 'POBox', 'LeasingAgent', 'Referral');

-- CreateEnum
CREATE TYPE "application_review_status_enum" AS ENUM ('pending', 'pendingAndValid', 'valid', 'duplicate');

-- CreateEnum
CREATE TYPE "application_status_enum" AS ENUM ('submitted', 'declined', 'receivedUnit', 'waitlist', 'waitlistDeclined');

-- CreateEnum
CREATE TYPE "application_submission_type_enum" AS ENUM ('paper', 'electronical');

-- CreateEnum
CREATE TYPE "deposit_type_enum" AS ENUM ('fixedDeposit', 'depositRange');

-- CreateEnum
CREATE TYPE "flagged_set_status_enum" AS ENUM ('flagged', 'pending', 'resolved');

-- CreateEnum
CREATE TYPE "listings_home_type_enum" AS ENUM ('apartment', 'duplex', 'house', 'townhome');

-- CreateEnum
CREATE TYPE "income_period_enum" AS ENUM ('perMonth', 'perYear');

-- CreateEnum
CREATE TYPE "languages_enum" AS ENUM ('en', 'es', 'vi', 'zh', 'tl', 'bn', 'ar');

-- CreateEnum
CREATE TYPE "listing_events_type_enum" AS ENUM ('openHouse', 'publicLottery', 'lotteryResults');

-- CreateEnum
CREATE TYPE "listings_status_enum" AS ENUM ('active', 'pending', 'closed', 'pendingReview', 'changesRequested');

-- CreateEnum
CREATE TYPE "listing_type_enum" AS ENUM ('regulated', 'nonRegulated');

-- CreateEnum
CREATE TYPE "lottery_status_enum" AS ENUM ('errored', 'ran', 'approved', 'releasedToPartners', 'publishedToPublic', 'expired');

-- CreateEnum
CREATE TYPE "listings_marketing_season_enum" AS ENUM ('spring', 'summer', 'fall', 'winter');

-- CreateEnum
CREATE TYPE "listings_marketing_type_enum" AS ENUM ('marketing', 'comingSoon');

-- CreateEnum
CREATE TYPE "month_enum" AS ENUM ('january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december');

-- CreateEnum
CREATE TYPE "monthly_rent_determination_type_enum" AS ENUM ('flatRent', 'percentageOfIncome');

-- CreateEnum
CREATE TYPE "multiselect_questions_application_section_enum" AS ENUM ('programs', 'preferences');

-- CreateEnum
CREATE TYPE "multiselect_questions_status_enum" AS ENUM ('draft', 'visible', 'active', 'toRetire', 'retired');

-- CreateEnum
CREATE TYPE "neighborhood_amenities_enum" AS ENUM ('groceryStores', 'publicTransportation', 'schools', 'parksAndCommunityCenters', 'pharmacies', 'healthCareResources', 'shoppingVenues', 'hospitals', 'seniorCenters', 'recreationalFacilities', 'playgrounds', 'busStops');

-- CreateEnum
CREATE TYPE "property_region_enum" AS ENUM ('Greater_Downtown', 'Eastside', 'Southwest', 'Westside');

-- CreateEnum
CREATE TYPE "rent_type_enum" AS ENUM ('fixedRent', 'rentRange');

-- CreateEnum
CREATE TYPE "listings_review_order_type_enum" AS ENUM ('lottery', 'firstComeFirstServe', 'waitlist', 'waitlistLottery');

-- CreateEnum
CREATE TYPE "rule_enum" AS ENUM ('nameAndDOB', 'email', 'combination');

-- CreateEnum
CREATE TYPE "unit_rent_type_enum" AS ENUM ('fixed', 'percentageOfIncome');

-- CreateEnum
CREATE TYPE "units_status_enum" AS ENUM ('unknown', 'available', 'occupied', 'unavailable');

-- CreateEnum
CREATE TYPE "unit_type_enum" AS ENUM ('studio', 'oneBdrm', 'twoBdrm', 'threeBdrm', 'fourBdrm', 'SRO', 'fiveBdrm');

-- CreateEnum
CREATE TYPE "user_role_enum" AS ENUM ('user', 'partner', 'admin', 'jurisdictionAdmin', 'limitedJurisdictionAdmin', 'supportAdmin');

-- CreateEnum
CREATE TYPE "validation_method_enum" AS ENUM ('radius', 'map', 'none');

-- CreateEnum
CREATE TYPE "yes_no_enum" AS ENUM ('yes', 'no');

-- CreateTable
CREATE TABLE "accessibility" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "hearing" BOOLEAN,
    "mobility" BOOLEAN,
    "other" BOOLEAN,
    "vision" BOOLEAN,

    CONSTRAINT "accessibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accessibility_snapshot" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "original_id" UUID NOT NULL,
    "original_created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "hearing" BOOLEAN,
    "mobility" BOOLEAN,
    "other" BOOLEAN,
    "vision" BOOLEAN,

    CONSTRAINT "accessibility_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_log" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "action" VARCHAR NOT NULL,
    "metadata" JSONB,
    "module" VARCHAR NOT NULL,
    "record_id" UUID,
    "user_id" UUID,

    CONSTRAINT "activity_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "address" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "city" TEXT,
    "county" TEXT,
    "latitude" DECIMAL,
    "longitude" DECIMAL,
    "place_name" TEXT,
    "state" TEXT,
    "street" TEXT,
    "street2" TEXT,
    "zip_code" TEXT,

    CONSTRAINT "address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "address_snapshot" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "original_id" UUID NOT NULL,
    "original_created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "city" TEXT,
    "county" TEXT,
    "latitude" DECIMAL,
    "longitude" DECIMAL,
    "place_name" TEXT,
    "state" TEXT,
    "street" TEXT,
    "street2" TEXT,
    "zip_code" TEXT,

    CONSTRAINT "address_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agency" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "jurisdictions_id" UUID,
    "name" TEXT NOT NULL,

    CONSTRAINT "agency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alternate_contact" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "agency" TEXT,
    "email_address" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "mailing_address_id" UUID,
    "other_type" TEXT,
    "phone_number" TEXT,
    "type" TEXT,

    CONSTRAINT "alternate_contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alternate_contact_snapshot_snapshot" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "original_id" UUID NOT NULL,
    "original_created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "agency" TEXT,
    "email_address" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "mailing_address_snapshot_id" UUID,
    "other_type" TEXT,
    "phone_number" TEXT,
    "type" TEXT,

    CONSTRAINT "alternate_contact_snapshot_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ami_chart" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "items" JSONB NOT NULL,
    "jurisdiction_id" UUID NOT NULL,
    "name" VARCHAR NOT NULL,

    CONSTRAINT "ami_chart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applicant" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "address_id" UUID,
    "birth_day" INTEGER,
    "birth_month" INTEGER,
    "birth_year" INTEGER,
    "email_address" TEXT,
    "first_name" TEXT,
    "full_time_student" "yes_no_enum",
    "last_name" TEXT,
    "middle_name" TEXT,
    "no_email" BOOLEAN,
    "no_phone" BOOLEAN,
    "phone_number" TEXT,
    "phone_number_type" TEXT,
    "work_address_id" UUID,
    "work_in_region" "yes_no_enum",

    CONSTRAINT "applicant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applicant_snapshot" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "original_id" UUID NOT NULL,
    "original_created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "address_snapshot_id" UUID,
    "birth_day" INTEGER,
    "birth_month" INTEGER,
    "birth_year" INTEGER,
    "email_address" TEXT,
    "first_name" TEXT,
    "full_time_student" "yes_no_enum",
    "last_name" TEXT,
    "middle_name" TEXT,
    "no_email" BOOLEAN,
    "no_phone" BOOLEAN,
    "phone_number" TEXT,
    "phone_number_type" TEXT,
    "work_address_snapshot_id" UUID,
    "work_in_region" "yes_no_enum",

    CONSTRAINT "applicant_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_flagged_set" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "listing_id" UUID NOT NULL,
    "resolved_time" TIMESTAMPTZ(6),
    "resolving_user_id" UUID,
    "rule" "rule_enum" NOT NULL,
    "rule_key" VARCHAR NOT NULL,
    "show_confirmation_alert" BOOLEAN NOT NULL DEFAULT false,
    "status" "flagged_set_status_enum" NOT NULL DEFAULT 'pending',

    CONSTRAINT "application_flagged_set_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_lottery_positions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "application_id" UUID NOT NULL,
    "listing_id" UUID NOT NULL,
    "multiselect_question_id" UUID,
    "ordinal" INTEGER NOT NULL,

    CONSTRAINT "application_lottery_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_lottery_totals" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "listing_id" UUID NOT NULL,
    "multiselect_question_id" UUID,
    "total" INTEGER NOT NULL,

    CONSTRAINT "application_lottery_totals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_methods" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "accepts_postmarked_applications" BOOLEAN,
    "external_reference" TEXT,
    "label" TEXT,
    "listing_id" UUID,
    "phone_number" TEXT,
    "type" "application_methods_type_enum" NOT NULL,

    CONSTRAINT "application_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_method_snapshot" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "original_id" UUID NOT NULL,
    "original_created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "accepts_postmarked_applications" BOOLEAN,
    "external_reference" TEXT,
    "label" TEXT,
    "listing_snapshot_id" UUID,
    "phone_number" TEXT,
    "type" "application_methods_type_enum" NOT NULL,

    CONSTRAINT "application_method_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "accepted_terms" BOOLEAN,
    "accessibility_id" UUID,
    "accessible_unit_waitlist_number" INTEGER,
    "additional_phone" BOOLEAN,
    "additional_phone_number" TEXT,
    "additional_phone_number_type" TEXT,
    "alternate_address_id" UUID,
    "alternate_contact_id" UUID,
    "applicant_id" UUID,
    "app_url" TEXT,
    "confirmation_code" TEXT NOT NULL,
    "contact_preferences" TEXT[],
    "conventional_unit_waitlist_number" INTEGER,
    "deleted_at" TIMESTAMP(6),
    "demographics_id" UUID,
    "expire_after" TIMESTAMP(6),
    "household_expecting_changes" BOOLEAN,
    "household_size" INTEGER,
    "household_student" BOOLEAN,
    "housing_status" TEXT,
    "income" TEXT,
    "income_period" "income_period_enum",
    "income_vouchers" BOOLEAN,
    "is_newest" BOOLEAN DEFAULT false,
    "language" "languages_enum",
    "listing_id" UUID,
    "mailing_address_id" UUID,
    "manual_lottery_position_number" INTEGER,
    "marked_as_duplicate" BOOLEAN NOT NULL DEFAULT false,
    "preferences" JSONB NOT NULL,
    "programs" JSONB,
    "review_status" "application_review_status_enum" NOT NULL DEFAULT 'pending',
    "send_mail_to_mailing_address" BOOLEAN,
    "status" "application_status_enum" NOT NULL DEFAULT 'submitted',
    "submission_date" TIMESTAMPTZ(6),
    "submission_type" "application_submission_type_enum" NOT NULL,
    "user_id" UUID,
    "was_created_externally" BOOLEAN NOT NULL DEFAULT false,
    "was_pii_cleared" BOOLEAN DEFAULT false,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_snapshot" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "original_id" UUID NOT NULL,
    "original_created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "accepted_terms" BOOLEAN,
    "accessibility_snapshot_id" UUID,
    "accessible_unit_waitlist_number" INTEGER,
    "additional_phone" BOOLEAN,
    "additional_phone_number" TEXT,
    "additional_phone_number_type" TEXT,
    "alternate_address_snapshot_id" UUID,
    "alternate_contact_snapshot_id" UUID,
    "applicant_snapshot_id" UUID,
    "app_url" TEXT,
    "confirmation_code" TEXT NOT NULL,
    "contact_preferences" TEXT[],
    "conventional_unit_waitlist_number" INTEGER,
    "deleted_at" TIMESTAMP(6),
    "demographic_snapshot_id" UUID,
    "expire_after" TIMESTAMP(6),
    "household_expecting_changes" BOOLEAN,
    "household_size" INTEGER,
    "household_student" BOOLEAN,
    "housing_status" TEXT,
    "income" TEXT,
    "income_period" "income_period_enum",
    "income_vouchers" BOOLEAN,
    "is_newest" BOOLEAN DEFAULT false,
    "language" "languages_enum",
    "listing_id" UUID,
    "mailing_address_snapshot_id" UUID,
    "manual_lottery_position_number" INTEGER,
    "marked_as_duplicate" BOOLEAN NOT NULL DEFAULT false,
    "preferences" JSONB NOT NULL,
    "programs" JSONB,
    "review_status" "application_review_status_enum" NOT NULL DEFAULT 'pending',
    "send_mail_to_mailing_address" BOOLEAN,
    "status" "application_status_enum" NOT NULL DEFAULT 'submitted',
    "submission_date" TIMESTAMPTZ(6),
    "submission_type" "application_submission_type_enum" NOT NULL,
    "user_id" UUID,
    "was_created_externally" BOOLEAN NOT NULL DEFAULT false,
    "was_pii_cleared" BOOLEAN DEFAULT false,

    CONSTRAINT "application_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_selection_options" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "address_holder_address_id" UUID,
    "address_holder_name" TEXT,
    "address_holder_relationship" TEXT,
    "application_selection_id" UUID NOT NULL,
    "is_geocoding_verified" BOOLEAN,
    "multiselect_option_id" UUID NOT NULL,

    CONSTRAINT "application_selection_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_selection_option_snapshot" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "original_id" UUID NOT NULL,
    "original_created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "address_holder_address_snapshot_id" UUID,
    "address_holder_name" TEXT,
    "address_holder_relationship" TEXT,
    "application_selection_snapshot_id" UUID NOT NULL,
    "is_geocoding_verified" BOOLEAN,
    "multiselect_option_id" UUID NOT NULL,

    CONSTRAINT "application_selection_option_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_selections" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "application_id" UUID NOT NULL,
    "has_opted_out" BOOLEAN,
    "multiselect_question_id" UUID NOT NULL,

    CONSTRAINT "application_selections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_selection_snapshot" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "original_id" UUID NOT NULL,
    "original_created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "application_snapshot_id" UUID NOT NULL,
    "has_opted_out" BOOLEAN,
    "multiselect_question_id" UUID NOT NULL,

    CONSTRAINT "application_selection_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "file_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_snapshot" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "original_id" UUID NOT NULL,
    "original_created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "file_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "asset_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cron_job" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "last_run_date" TIMESTAMPTZ(6),
    "name" TEXT,

    CONSTRAINT "cron_job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demographics" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "ethnicity" TEXT,
    "gender" TEXT,
    "how_did_you_hear" TEXT[],
    "race" TEXT[],
    "sexual_orientation" TEXT,

    CONSTRAINT "demographics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demographic_snapshot" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "original_id" UUID NOT NULL,
    "original_created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "ethnicity" TEXT,
    "gender" TEXT,
    "how_did_you_hear" TEXT[],
    "race" TEXT[],
    "sexual_orientation" TEXT,

    CONSTRAINT "demographic_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generated_listing_translations" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "jurisdiction_id" VARCHAR NOT NULL,
    "language" "languages_enum" NOT NULL,
    "listing_id" VARCHAR NOT NULL,
    "timestamp" TIMESTAMP(6) NOT NULL,
    "translations" JSONB NOT NULL,

    CONSTRAINT "generated_listing_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "household_member" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "address_id" UUID,
    "application_id" UUID,
    "birth_day" INTEGER,
    "birth_month" INTEGER,
    "birth_year" INTEGER,
    "first_name" TEXT,
    "full_time_student" "yes_no_enum",
    "last_name" TEXT,
    "middle_name" TEXT,
    "order_id" INTEGER,
    "relationship" TEXT,
    "same_address" "yes_no_enum",
    "work_address_id" UUID,
    "work_in_region" "yes_no_enum",

    CONSTRAINT "household_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "household_member_snapshot" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "original_id" UUID NOT NULL,
    "original_created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "address_snapshot_id" UUID,
    "application_snapshot_id" UUID,
    "birth_day" INTEGER,
    "birth_month" INTEGER,
    "birth_year" INTEGER,
    "first_name" TEXT,
    "full_time_student" "yes_no_enum",
    "last_name" TEXT,
    "middle_name" TEXT,
    "order_id" INTEGER,
    "relationship" TEXT,
    "same_address" "yes_no_enum",
    "work_address_snapshot_id" UUID,
    "work_in_region" "yes_no_enum",

    CONSTRAINT "household_member_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jurisdictions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "allow_single_use_code_login" BOOLEAN NOT NULL DEFAULT false,
    "duplicate_listing_permissions" "user_role_enum"[],
    "email_from_address" TEXT,
    "enable_geocoding_preferences" BOOLEAN NOT NULL DEFAULT false,
    "enable_geocoding_radius_method" BOOLEAN NOT NULL DEFAULT false,
    "enable_partner_demographics" BOOLEAN NOT NULL DEFAULT false,
    "enable_partner_settings" BOOLEAN NOT NULL DEFAULT false,
    "languages" "languages_enum"[] DEFAULT ARRAY['en']::"languages_enum"[],
    "listing_approval_permission" "user_role_enum"[],
    "listing_features_configuration" JSONB,
    "minimum_listing_publish_images_required" INTEGER DEFAULT 1,
    "name" TEXT NOT NULL,
    "notifications_sign_up_url" TEXT,
    "partner_terms" TEXT,
    "public_url" TEXT NOT NULL DEFAULT '',
    "regions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "rental_assistance_default" TEXT NOT NULL,
    "required_listing_fields" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "visible_neighborhood_amenities" "neighborhood_amenities_enum"[] DEFAULT ARRAY['groceryStores', 'publicTransportation', 'schools', 'parksAndCommunityCenters', 'pharmacies', 'healthCareResources']::"neighborhood_amenities_enum"[],
    "what_to_expect" TEXT NOT NULL DEFAULT 'Applicants will be contacted by the property agent in rank order until vacancies are filled. All of the information that you have provided will be verified and your eligibility confirmed. Your application will be removed from the waitlist if you have made any fraudulent statements. If we cannot verify a housing preference that you have claimed, you will not receive the preference but will not be otherwise penalized. Should your application be chosen, be prepared to fill out a more detailed application and provide required supporting documents.',
    "what_to_expect_additional_text" TEXT NOT NULL DEFAULT '',
    "what_to_expect_under_construction" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "jurisdictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_documents" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "birth_certificate" BOOLEAN,
    "current_landlord_reference" BOOLEAN,
    "government_issued_id" BOOLEAN,
    "previous_landlord_reference" BOOLEAN,
    "proof_of_assets" BOOLEAN,
    "proof_of_custody" BOOLEAN,
    "proof_of_income" BOOLEAN,
    "residency_documents" BOOLEAN,
    "social_security_card" BOOLEAN,

    CONSTRAINT "listing_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_document_snapshot" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "original_id" UUID NOT NULL,
    "original_created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "birth_certificate" BOOLEAN,
    "current_landlord_reference" BOOLEAN,
    "government_issued_id" BOOLEAN,
    "previous_landlord_reference" BOOLEAN,
    "proof_of_assets" BOOLEAN,
    "proof_of_custody" BOOLEAN,
    "proof_of_income" BOOLEAN,
    "residency_documents" BOOLEAN,
    "social_security_card" BOOLEAN,

    CONSTRAINT "listing_document_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_events" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "end_time" TIMESTAMPTZ(6),
    "file_id" UUID,
    "label" TEXT,
    "listing_id" UUID,
    "note" TEXT,
    "start_date" TIMESTAMPTZ(6),
    "start_time" TIMESTAMPTZ(6),
    "type" "listing_events_type_enum" NOT NULL,
    "url" TEXT,

    CONSTRAINT "listing_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_event_snapshot" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "original_id" UUID NOT NULL,
    "original_created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "end_time" TIMESTAMPTZ(6),
    "file_snapshot_id" UUID,
    "label" TEXT,
    "listing_snapshot_id" UUID,
    "note" TEXT,
    "start_date" TIMESTAMPTZ(6),
    "start_time" TIMESTAMPTZ(6),
    "type" "listing_events_type_enum" NOT NULL,
    "url" TEXT,

    CONSTRAINT "listing_event_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_features" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "accessible_height_toilet" BOOLEAN,
    "accessible_parking" BOOLEAN,
    "ac_in_unit" BOOLEAN,
    "barrier_free_bathroom" BOOLEAN,
    "barrier_free_entrance" BOOLEAN,
    "barrier_free_property_entrance" BOOLEAN,
    "barrier_free_unit_entrance" BOOLEAN,
    "bath_grab_bars_or_reinforcements" BOOLEAN,
    "bathroom_counter_lowered" BOOLEAN,
    "braille_signage_in_building" BOOLEAN,
    "carbon_monoxide_detector_with_strobe" BOOLEAN,
    "carpet_in_unit" BOOLEAN,
    "elevator" BOOLEAN,
    "extra_audible_carbon_monoxide_detector" BOOLEAN,
    "extra_audible_smoke_detector" BOOLEAN,
    "fire_suppression_sprinkler_system" BOOLEAN,
    "front_controls_dishwasher" BOOLEAN,
    "front_controls_stove_cook_top" BOOLEAN,
    "grab_bars" BOOLEAN,
    "hard_flooring_in_unit" BOOLEAN,
    "hearing" BOOLEAN,
    "hearing_and_vision" BOOLEAN,
    "heating_in_unit" BOOLEAN,
    "in_unit_washer_dryer" BOOLEAN,
    "kitchen_counter_lowered" BOOLEAN,
    "laundry_in_building" BOOLEAN,
    "lever_handles_on_doors" BOOLEAN,
    "lever_handles_on_faucets" BOOLEAN,
    "lowered_cabinets" BOOLEAN,
    "lowered_light_switch" BOOLEAN,
    "mobility" BOOLEAN,
    "no_entry_stairs" BOOLEAN,
    "non_digital_kitchen_appliances" BOOLEAN,
    "no_stairs_to_parking_spots" BOOLEAN,
    "no_stairs_within_unit" BOOLEAN,
    "parking_on_site" BOOLEAN,
    "refrigerator_with_bottom_door_freezer" BOOLEAN,
    "roll_in_shower" BOOLEAN,
    "service_animals_allowed" BOOLEAN,
    "smoke_detector_with_strobe" BOOLEAN,
    "street_level_entrance" BOOLEAN,
    "toilet_grab_bars_or_reinforcements" BOOLEAN,
    "tty_amplified_phone" BOOLEAN,
    "turning_circle_in_bathrooms" BOOLEAN,
    "visual" BOOLEAN,
    "walk_in_shower" BOOLEAN,
    "wheelchair_ramp" BOOLEAN,
    "wide_doorways" BOOLEAN,

    CONSTRAINT "listing_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_feature_snapshot" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "original_id" UUID NOT NULL,
    "original_created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "accessible_height_toilet" BOOLEAN,
    "accessible_parking" BOOLEAN,
    "ac_in_unit" BOOLEAN,
    "barrier_free_bathroom" BOOLEAN,
    "barrier_free_entrance" BOOLEAN,
    "barrier_free_property_entrance" BOOLEAN,
    "barrier_free_unit_entrance" BOOLEAN,
    "bath_grab_bars_or_reinforcements" BOOLEAN,
    "bathroom_counter_lowered" BOOLEAN,
    "braille_signage_in_building" BOOLEAN,
    "carbon_monoxide_detector_with_strobe" BOOLEAN,
    "carpet_in_unit" BOOLEAN,
    "elevator" BOOLEAN,
    "extra_audible_carbon_monoxide_detector" BOOLEAN,
    "extra_audible_smoke_detector" BOOLEAN,
    "fire_suppression_sprinkler_system" BOOLEAN,
    "front_controls_dishwasher" BOOLEAN,
    "front_controls_stove_cook_top" BOOLEAN,
    "grab_bars" BOOLEAN,
    "hard_flooring_in_unit" BOOLEAN,
    "hearing" BOOLEAN,
    "hearing_and_vision" BOOLEAN,
    "heating_in_unit" BOOLEAN,
    "in_unit_washer_dryer" BOOLEAN,
    "kitchen_counter_lowered" BOOLEAN,
    "laundry_in_building" BOOLEAN,
    "lever_handles_on_doors" BOOLEAN,
    "lever_handles_on_faucets" BOOLEAN,
    "lowered_cabinets" BOOLEAN,
    "lowered_light_switch" BOOLEAN,
    "mobility" BOOLEAN,
    "no_entry_stairs" BOOLEAN,
    "non_digital_kitchen_appliances" BOOLEAN,
    "no_stairs_to_parking_spots" BOOLEAN,
    "no_stairs_within_unit" BOOLEAN,
    "parking_on_site" BOOLEAN,
    "refrigerator_with_bottom_door_freezer" BOOLEAN,
    "roll_in_shower" BOOLEAN,
    "service_animals_allowed" BOOLEAN,
    "smoke_detector_with_strobe" BOOLEAN,
    "street_level_entrance" BOOLEAN,
    "toilet_grab_bars_or_reinforcements" BOOLEAN,
    "tty_amplified_phone" BOOLEAN,
    "turning_circle_in_bathrooms" BOOLEAN,
    "visual" BOOLEAN,
    "walk_in_shower" BOOLEAN,
    "wheelchair_ramp" BOOLEAN,
    "wide_doorways" BOOLEAN,

    CONSTRAINT "listing_feature_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_images" (
    "description" TEXT,
    "image_id" UUID NOT NULL,
    "listing_id" UUID NOT NULL,
    "ordinal" INTEGER,

    CONSTRAINT "listing_images_pkey" PRIMARY KEY ("listing_id","image_id")
);

-- CreateTable
CREATE TABLE "listing_image_snapshot" (
    "description" TEXT,
    "image_snapshot_id" UUID NOT NULL,
    "listing_snapshot_id" UUID NOT NULL,
    "ordinal" INTEGER,

    CONSTRAINT "listing_image_snapshot_pkey" PRIMARY KEY ("listing_snapshot_id","image_snapshot_id")
);

-- CreateTable
CREATE TABLE "listing_multiselect_questions" (
    "listing_id" UUID NOT NULL,
    "multiselect_question_id" UUID NOT NULL,
    "ordinal" INTEGER,

    CONSTRAINT "listing_multiselect_questions_pkey" PRIMARY KEY ("listing_id","multiselect_question_id")
);

-- CreateTable
CREATE TABLE "listing_multiselect_question_snapshot" (
    "listing_snapshot_id" UUID NOT NULL,
    "multiselect_question_id" UUID NOT NULL,
    "ordinal" INTEGER,

    CONSTRAINT "listing_multiselect_question_snapshot_pkey" PRIMARY KEY ("listing_snapshot_id","multiselect_question_id")
);

-- CreateTable
CREATE TABLE "listing_neighborhood_amenities" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "bus_stops" TEXT,
    "grocery_stores" TEXT,
    "health_care_resources" TEXT,
    "hospitals" TEXT,
    "parks_and_community_centers" TEXT,
    "pharmacies" TEXT,
    "playgrounds" TEXT,
    "public_transportation" TEXT,
    "recreational_facilities" TEXT,
    "schools" TEXT,
    "senior_centers" TEXT,
    "shopping_venues" TEXT,

    CONSTRAINT "listing_neighborhood_amenities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_neighborhood_amenity_snapshot" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "original_id" UUID NOT NULL,
    "original_created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "bus_stops" TEXT,
    "grocery_stores" TEXT,
    "health_care_resources" TEXT,
    "hospitals" TEXT,
    "parks_and_community_centers" TEXT,
    "pharmacies" TEXT,
    "playgrounds" TEXT,
    "public_transportation" TEXT,
    "recreational_facilities" TEXT,
    "schools" TEXT,
    "senior_centers" TEXT,
    "shopping_venues" TEXT,

    CONSTRAINT "listing_neighborhood_amenity_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listings" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "accessibility" TEXT,
    "accessible_marketing_flyer" TEXT,
    "accessible_marketing_flyer_file_id" UUID,
    "additional_application_submission_notes" TEXT,
    "afs_last_run_at" TIMESTAMPTZ(6) DEFAULT '1970-01-01 00:00:00-07'::timestamp with time zone,
    "allows_cats" BOOLEAN,
    "allows_dogs" BOOLEAN,
    "amenities" TEXT,
    "ami_percentage_max" INTEGER,
    "ami_percentage_min" INTEGER,
    "application_drop_off_address_id" UUID,
    "application_drop_off_address_office_hours" TEXT,
    "application_drop_off_address_type" "listings_application_address_type_enum",
    "application_due_date" TIMESTAMPTZ(6),
    "application_mailing_address_id" UUID,
    "application_mailing_address_type" "listings_application_address_type_enum",
    "application_open_date" TIMESTAMPTZ(6),
    "application_organization" TEXT,
    "application_pick_up_address_id" UUID,
    "application_pick_up_address_office_hours" TEXT,
    "application_pick_up_address_type" "listings_application_address_type_enum",
    "assets" JSONB NOT NULL,
    "building_address_id" UUID,
    "building_selection_criteria" TEXT,
    "building_selection_criteria_file_id" UUID,
    "building_total_units" INTEGER,
    "closed_at" TIMESTAMPTZ(6),
    "coc_info" TEXT,
    "common_digital_application" BOOLEAN,
    "community_disclaimer_description" TEXT,
    "community_disclaimer_title" TEXT,
    "configurable_region" TEXT,
    "content_updated_at" TIMESTAMPTZ(6),
    "copy_of_id" UUID,
    "costs_not_included" TEXT,
    "credit_history" TEXT,
    "criminal_background" TEXT,
    "custom_map_pin" BOOLEAN,
    "deposit_helper_text" TEXT,
    "deposit_max" TEXT,
    "deposit_min" TEXT,
    "deposit_type" "deposit_type_enum",
    "deposit_value" DECIMAL(8,2),
    "developer" TEXT,
    "digital_application" BOOLEAN,
    "disable_units_accordion" BOOLEAN,
    "display_waitlist_size" BOOLEAN NOT NULL,
    "documents_id" UUID,
    "features_id" UUID,
    "has_hud_ebll_clearance" BOOLEAN,
    "home_type" "listings_home_type_enum",
    "household_size_max" INTEGER,
    "household_size_min" INTEGER,
    "hrd_id" TEXT,
    "include_community_disclaimer" BOOLEAN,
    "is_verified" BOOLEAN DEFAULT false,
    "is_waitlist_open" BOOLEAN,
    "jurisdiction_id" UUID,
    "last_application_update_at" TIMESTAMPTZ(6) DEFAULT '1970-01-01 00:00:00-07'::timestamp with time zone,
    "last_updated_by_user_id" UUID,
    "leasing_agent_address_id" UUID,
    "leasing_agent_email" TEXT,
    "leasing_agent_name" TEXT,
    "leasing_agent_office_hours" TEXT,
    "leasing_agent_phone" TEXT,
    "leasing_agent_title" TEXT,
    "listing_file_number" TEXT,
    "listing_type" "listing_type_enum" NOT NULL DEFAULT 'regulated',
    "lottery_last_published_at" TIMESTAMPTZ(6),
    "lottery_last_run_at" TIMESTAMPTZ(6),
    "lottery_opt_in" BOOLEAN,
    "lottery_status" "lottery_status_enum",
    "management_company" TEXT,
    "management_website" TEXT,
    "marketing_flyer" TEXT,
    "marketing_flyer_file_id" UUID,
    "marketing_month" "month_enum",
    "marketing_season" "listings_marketing_season_enum",
    "marketing_type" "listings_marketing_type_enum" NOT NULL DEFAULT 'marketing',
    "marketing_year" INTEGER,
    "name" TEXT NOT NULL,
    "neighborhood" TEXT,
    "neighborhood_amenities_id" UUID,
    "owner_company" TEXT,
    "paper_application" BOOLEAN,
    "parking_fee" TEXT,
    "parking_type_id" UUID,
    "pet_policy" TEXT,
    "phone_number" TEXT,
    "postmarked_applications_received_by_date" TIMESTAMPTZ(6),
    "program_rules" TEXT,
    "property_id" UUID,
    "published_at" TIMESTAMPTZ(6),
    "referral_opportunity" BOOLEAN,
    "region" "property_region_enum",
    "rental_assistance" TEXT,
    "rental_history" TEXT,
    "requested_changes" TEXT,
    "requested_changes_date" TIMESTAMPTZ(6) DEFAULT '1970-01-01 00:00:00-07'::timestamp with time zone,
    "requested_changes_user_id" UUID,
    "required_documents" TEXT,
    "reserved_community_description" TEXT,
    "reserved_community_min_age" INTEGER,
    "reserved_community_type_id" UUID,
    "result_id" UUID,
    "result_link" TEXT,
    "review_order_type" "listings_review_order_type_enum",
    "section8_acceptance" BOOLEAN,
    "services_offered" TEXT,
    "smoking_policy" TEXT,
    "special_notes" TEXT,
    "status" "listings_status_enum" NOT NULL DEFAULT 'pending',
    "temporary_listing_id" INTEGER,
    "unit_amenities" TEXT,
    "units_available" INTEGER,
    "utilities_id" UUID,
    "verified_at" TIMESTAMPTZ(6),
    "waitlist_current_size" INTEGER,
    "waitlist_max_size" INTEGER,
    "waitlist_open_spots" INTEGER,
    "was_created_externally" BOOLEAN NOT NULL DEFAULT false,
    "what_to_expect" TEXT,
    "what_to_expect_additional_text" TEXT,
    "year_built" INTEGER,

    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_parking_type" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "on_street" BOOLEAN,
    "off_street" BOOLEAN,
    "garage" BOOLEAN,
    "carport" BOOLEAN,

    CONSTRAINT "listing_parking_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_snapshot" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "original_id" UUID NOT NULL,
    "original_created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "accessibility" TEXT,
    "accessible_marketing_flyer" TEXT,
    "accessible_marketing_flyer_file_snapshot_id" UUID,
    "additional_application_submission_notes" TEXT,
    "afs_last_run_at" TIMESTAMPTZ(6) DEFAULT '1970-01-01 00:00:00-07'::timestamp with time zone,
    "allows_cats" BOOLEAN,
    "allows_dogs" BOOLEAN,
    "amenities" TEXT,
    "ami_percentage_max" INTEGER,
    "ami_percentage_min" INTEGER,
    "application_drop_off_address_snapshot_id" UUID,
    "application_drop_off_address_office_hours" TEXT,
    "application_drop_off_address_type" "listings_application_address_type_enum",
    "application_due_date" TIMESTAMPTZ(6),
    "application_mailing_address_snapshot_id" UUID,
    "application_mailing_address_type" "listings_application_address_type_enum",
    "application_open_date" TIMESTAMPTZ(6),
    "application_organization" TEXT,
    "application_pick_up_address_snapshot_id" UUID,
    "application_pick_up_address_office_hours" TEXT,
    "application_pick_up_address_type" "listings_application_address_type_enum",
    "assets" JSONB NOT NULL,
    "building_address_snapshot_id" UUID,
    "building_selection_criteria" TEXT,
    "building_selection_criteria_file_snapshot_id" UUID,
    "building_total_units" INTEGER,
    "closed_at" TIMESTAMPTZ(6),
    "coc_info" TEXT,
    "common_digital_application" BOOLEAN,
    "community_disclaimer_description" TEXT,
    "community_disclaimer_title" TEXT,
    "configurable_region" TEXT,
    "content_updated_at" TIMESTAMPTZ(6),
    "copy_of_id" UUID,
    "costs_not_included" TEXT,
    "credit_history" TEXT,
    "criminal_background" TEXT,
    "custom_map_pin" BOOLEAN,
    "deposit_helper_text" TEXT,
    "deposit_max" TEXT,
    "deposit_min" TEXT,
    "deposit_type" "deposit_type_enum",
    "deposit_value" DECIMAL(8,2),
    "developer" TEXT,
    "digital_application" BOOLEAN,
    "disable_units_accordion" BOOLEAN,
    "display_waitlist_size" BOOLEAN NOT NULL,
    "document_snapshot_id" UUID,
    "feature_snapshot_id" UUID,
    "has_hud_ebll_clearance" BOOLEAN,
    "home_type" "listings_home_type_enum",
    "household_size_max" INTEGER,
    "household_size_min" INTEGER,
    "hrd_id" TEXT,
    "include_community_disclaimer" BOOLEAN,
    "is_verified" BOOLEAN DEFAULT false,
    "is_waitlist_open" BOOLEAN,
    "jurisdiction_id" UUID,
    "last_application_update_at" TIMESTAMPTZ(6) DEFAULT '1970-01-01 00:00:00-07'::timestamp with time zone,
    "last_updated_by_user_id" UUID,
    "leasing_agent_address_snapshot_id" UUID,
    "leasing_agent_email" TEXT,
    "leasing_agent_name" TEXT,
    "leasing_agent_office_hours" TEXT,
    "leasing_agent_phone" TEXT,
    "leasing_agent_title" TEXT,
    "listing_file_number" TEXT,
    "listing_type" "listing_type_enum" NOT NULL DEFAULT 'regulated',
    "lottery_last_published_at" TIMESTAMPTZ(6),
    "lottery_last_run_at" TIMESTAMPTZ(6),
    "lottery_opt_in" BOOLEAN,
    "lottery_status" "lottery_status_enum",
    "management_company" TEXT,
    "management_website" TEXT,
    "marketing_flyer" TEXT,
    "marketing_flyer_file_snapshot_id" UUID,
    "marketing_month" "month_enum",
    "marketing_season" "listings_marketing_season_enum",
    "marketing_type" "listings_marketing_type_enum" NOT NULL DEFAULT 'marketing',
    "marketing_year" INTEGER,
    "name" TEXT NOT NULL,
    "neighborhood" TEXT,
    "neighborhood_amenity_snapshot_id" UUID,
    "owner_company" TEXT,
    "paper_application" BOOLEAN,
    "parking_fee" TEXT,
    "pet_policy" TEXT,
    "phone_number" TEXT,
    "postmarked_applications_received_by_date" TIMESTAMPTZ(6),
    "program_rules" TEXT,
    "property_snapshot_id" UUID,
    "published_at" TIMESTAMPTZ(6),
    "referral_opportunity" BOOLEAN,
    "region" "property_region_enum",
    "rental_assistance" TEXT,
    "rental_history" TEXT,
    "requested_changes" TEXT,
    "requested_changes_date" TIMESTAMPTZ(6) DEFAULT '1970-01-01 00:00:00-07'::timestamp with time zone,
    "requested_changes_user_id" UUID,
    "required_documents" TEXT,
    "reserved_community_description" TEXT,
    "reserved_community_min_age" INTEGER,
    "reserved_community_type_id" UUID,
    "result_snapshot_id" UUID,
    "result_link" TEXT,
    "review_order_type" "listings_review_order_type_enum",
    "section8_acceptance" BOOLEAN,
    "services_offered" TEXT,
    "smoking_policy" TEXT,
    "special_notes" TEXT,
    "status" "listings_status_enum" NOT NULL DEFAULT 'pending',
    "temporary_listing_id" INTEGER,
    "unit_amenities" TEXT,
    "units_available" INTEGER,
    "utility_snapshot_id" UUID,
    "verified_at" TIMESTAMPTZ(6),
    "waitlist_current_size" INTEGER,
    "waitlist_max_size" INTEGER,
    "waitlist_open_spots" INTEGER,
    "was_created_externally" BOOLEAN NOT NULL DEFAULT false,
    "what_to_expect" TEXT,
    "what_to_expect_additional_text" TEXT,
    "year_built" INTEGER,

    CONSTRAINT "listing_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_utilities" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "cable" BOOLEAN,
    "electricity" BOOLEAN,
    "gas" BOOLEAN,
    "internet" BOOLEAN,
    "phone" BOOLEAN,
    "sewer" BOOLEAN,
    "trash" BOOLEAN,
    "water" BOOLEAN,

    CONSTRAINT "listing_utilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_utility_snapshot" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "original_id" UUID NOT NULL,
    "original_created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "cable" BOOLEAN,
    "electricity" BOOLEAN,
    "gas" BOOLEAN,
    "internet" BOOLEAN,
    "phone" BOOLEAN,
    "sewer" BOOLEAN,
    "trash" BOOLEAN,
    "water" BOOLEAN,

    CONSTRAINT "listing_utility_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "map_layers" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "feature_collection" JSONB NOT NULL DEFAULT '{}',
    "jurisdiction_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "map_layers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "multiselect_options" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "description" TEXT,
    "is_opt_out" BOOLEAN NOT NULL DEFAULT false,
    "links" JSONB,
    "map_layer_id" TEXT,
    "map_pin_position" TEXT,
    "multiselect_question_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "ordinal" INTEGER NOT NULL,
    "radius_size" INTEGER,
    "should_collect_address" BOOLEAN,
    "should_collect_name" BOOLEAN,
    "should_collect_relationship" BOOLEAN,
    "validation_method" "validation_method_enum",

    CONSTRAINT "multiselect_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "multiselect_questions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "application_section" "multiselect_questions_application_section_enum" NOT NULL,
    "description" TEXT,
    "hide_from_listing" BOOLEAN,
    "is_exclusive" BOOLEAN NOT NULL,
    "jurisdiction_id" UUID NOT NULL,
    "links" JSONB,
    "name" TEXT NOT NULL,
    "options" JSONB,
    "opt_out_text" TEXT,
    "status" "multiselect_questions_status_enum" NOT NULL DEFAULT 'draft',
    "sub_text" TEXT,
    "text" TEXT NOT NULL,
    "was_created_externally" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "multiselect_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paper_applications" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "application_method_id" UUID,
    "file_id" UUID,
    "language" "languages_enum" NOT NULL,

    CONSTRAINT "paper_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paper_application_snapshot" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "application_method_snapshot_id" UUID,
    "file_snapshot_id" UUID,
    "language" "languages_enum" NOT NULL,

    CONSTRAINT "paper_application_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "description" TEXT,
    "jurisdiction_id" UUID,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "url_title" TEXT,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_snapshot" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "original_id" UUID NOT NULL,
    "original_created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "description" TEXT,
    "jurisdiction_id" UUID,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "url_title" TEXT,

    CONSTRAINT "property_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reserved_community_types" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "description" TEXT,
    "jurisdiction_id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "reserved_community_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "script_runs" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "did_script_run" BOOLEAN NOT NULL DEFAULT false,
    "script_name" TEXT NOT NULL,
    "triggering_user" UUID NOT NULL,

    CONSTRAINT "script_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "translations" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "jurisdiction_id" UUID,
    "language" "languages_enum" NOT NULL,
    "translations" JSONB NOT NULL,

    CONSTRAINT "translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_accessibility_priority_types" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "unit_accessibility_priority_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_ami_chart_overrides" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "items" JSONB NOT NULL,

    CONSTRAINT "unit_ami_chart_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_ami_chart_override_snapshot" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "original_id" UUID NOT NULL,
    "original_created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "items" JSONB NOT NULL,

    CONSTRAINT "unit_ami_chart_override_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_group" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "bathroom_max" DECIMAL,
    "bathroom_min" DECIMAL,
    "flat_rent_value_from" DECIMAL,
    "flat_rent_value_to" DECIMAL,
    "floor_max" INTEGER,
    "floor_min" INTEGER,
    "listing_id" UUID,
    "max_occupancy" INTEGER,
    "min_occupancy" INTEGER,
    "monthly_rent" DECIMAL,
    "open_waitlist" BOOLEAN NOT NULL DEFAULT true,
    "priority_type_id" UUID,
    "rent_type" "rent_type_enum",
    "sq_feet_max" DECIMAL,
    "sq_feet_min" DECIMAL,
    "total_available" INTEGER,
    "total_count" INTEGER,

    CONSTRAINT "unit_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_group_snapshot" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "original_id" UUID NOT NULL,
    "original_created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "bathroom_max" DECIMAL,
    "bathroom_min" DECIMAL,
    "flat_rent_value_from" DECIMAL,
    "flat_rent_value_to" DECIMAL,
    "floor_max" INTEGER,
    "floor_min" INTEGER,
    "listing_snapshot_id" UUID,
    "max_occupancy" INTEGER,
    "min_occupancy" INTEGER,
    "monthly_rent" DECIMAL,
    "open_waitlist" BOOLEAN NOT NULL DEFAULT true,
    "priority_type_id" UUID,
    "rent_type" "rent_type_enum",
    "sq_feet_max" DECIMAL,
    "sq_feet_min" DECIMAL,
    "total_available" INTEGER,
    "total_count" INTEGER,

    CONSTRAINT "unit_group_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_group_ami_levels" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "ami_chart_id" UUID,
    "ami_percentage" INTEGER,
    "flat_rent_value" DECIMAL,
    "monthly_rent_determination_type" "monthly_rent_determination_type_enum" NOT NULL,
    "percentage_of_income_value" DECIMAL,
    "unit_group_id" UUID,

    CONSTRAINT "unit_group_ami_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_group_ami_level_snapshot" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "original_id" UUID NOT NULL,
    "original_created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "ami_chart_id" UUID,
    "ami_percentage" INTEGER,
    "flat_rent_value" DECIMAL,
    "monthly_rent_determination_type" "monthly_rent_determination_type_enum" NOT NULL,
    "percentage_of_income_value" DECIMAL,
    "unit_group_snapshot_id" UUID,

    CONSTRAINT "unit_group_ami_level_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_rent_types" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "name" "unit_rent_type_enum" NOT NULL,

    CONSTRAINT "unit_rent_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "ami_chart_id" UUID,
    "ami_chart_override_id" UUID,
    "ami_percentage" TEXT,
    "annual_income_max" TEXT,
    "annual_income_min" TEXT,
    "bmr_program_chart" BOOLEAN,
    "floor" INTEGER,
    "listing_id" UUID,
    "max_occupancy" INTEGER,
    "min_occupancy" INTEGER,
    "monthly_income_min" TEXT,
    "monthly_rent" TEXT,
    "monthly_rent_as_percent_of_income" DECIMAL(8,2),
    "num_bathrooms" INTEGER,
    "num_bedrooms" INTEGER,
    "number" TEXT,
    "priority_type_id" UUID,
    "sq_feet" DECIMAL(8,2),
    "unit_rent_type_id" UUID,
    "unit_type_id" UUID,
    "status" "units_status_enum" NOT NULL DEFAULT 'unknown',

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_snapshot" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "original_id" UUID NOT NULL,
    "original_created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "ami_chart_id" UUID,
    "ami_chart_override_snapshot_id" UUID,
    "ami_percentage" TEXT,
    "annual_income_max" TEXT,
    "annual_income_min" TEXT,
    "bmr_program_chart" BOOLEAN,
    "floor" INTEGER,
    "listing_snapshot_id" UUID,
    "max_occupancy" INTEGER,
    "min_occupancy" INTEGER,
    "monthly_income_min" TEXT,
    "monthly_rent" TEXT,
    "monthly_rent_as_percent_of_income" DECIMAL(8,2),
    "num_bathrooms" INTEGER,
    "num_bedrooms" INTEGER,
    "number" TEXT,
    "priority_type_id" UUID,
    "sq_feet" DECIMAL(8,2),
    "status" "units_status_enum" NOT NULL DEFAULT 'unknown',
    "unit_rent_type_id" UUID,
    "unit_type_id" UUID,

    CONSTRAINT "unit_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units_summary" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "ami_percentage" INTEGER,
    "floor_max" INTEGER,
    "floor_min" INTEGER,
    "listing_id" UUID,
    "max_occupancy" INTEGER,
    "minimum_income_max" TEXT,
    "minimum_income_min" TEXT,
    "min_occupancy" INTEGER,
    "monthly_rent_as_percent_of_income" DECIMAL(8,2),
    "monthly_rent_max" INTEGER,
    "monthly_rent_min" INTEGER,
    "priority_type_id" UUID,
    "sq_feet_max" DECIMAL(8,2),
    "sq_feet_min" DECIMAL(8,2),
    "total_available" INTEGER,
    "total_count" INTEGER,
    "unit_type_id" UUID,

    CONSTRAINT "units_summary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units_summary_snapshot" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ami_percentage" INTEGER,
    "floor_max" INTEGER,
    "floor_min" INTEGER,
    "listing_snapshot_id" UUID,
    "max_occupancy" INTEGER,
    "minimum_income_max" TEXT,
    "minimum_income_min" TEXT,
    "min_occupancy" INTEGER,
    "monthly_rent_as_percent_of_income" DECIMAL(8,2),
    "monthly_rent_max" INTEGER,
    "monthly_rent_min" INTEGER,
    "priority_type_id" UUID,
    "sq_feet_max" DECIMAL(8,2),
    "sq_feet_min" DECIMAL(8,2),
    "total_available" INTEGER,
    "total_count" INTEGER,
    "unit_type_id" UUID,

    CONSTRAINT "units_summary_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_types" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "name" "unit_type_enum" NOT NULL,
    "num_bedrooms" INTEGER NOT NULL,

    CONSTRAINT "unit_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_accounts" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "active_access_token" VARCHAR,
    "active_refresh_token" VARCHAR,
    "additional_phone_extension" TEXT,
    "additional_phone_number" TEXT,
    "additional_phone_number_type" TEXT,
    "address_id" UUID,
    "agency_id" UUID,
    "agreed_to_terms_of_service" BOOLEAN NOT NULL DEFAULT false,
    "confirmation_token" VARCHAR,
    "confirmed_at" TIMESTAMPTZ(6),
    "dob" TIMESTAMP(6),
    "email" VARCHAR NOT NULL,
    "failed_login_attempts_count" INTEGER NOT NULL DEFAULT 0,
    "first_name" VARCHAR NOT NULL,
    "hit_confirmation_url" TIMESTAMPTZ(6),
    "is_advocate" BOOLEAN NOT NULL DEFAULT false,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "language" "languages_enum",
    "last_login_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_name" VARCHAR NOT NULL,
    "mfa_enabled" BOOLEAN NOT NULL DEFAULT false,
    "middle_name" VARCHAR,
    "password_hash" VARCHAR NOT NULL,
    "password_updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "password_valid_for_days" INTEGER NOT NULL DEFAULT 365,
    "phone_extension" TEXT,
    "phone_number" VARCHAR,
    "phone_number_verified" BOOLEAN DEFAULT false,
    "phone_type" TEXT,
    "reset_token" VARCHAR,
    "single_use_code" VARCHAR,
    "single_use_code_updated_at" TIMESTAMPTZ(6),
    "title" TEXT,
    "was_warned_of_deletion" BOOLEAN DEFAULT false,

    CONSTRAINT "user_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_account_snapshot" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "original_id" UUID NOT NULL,
    "original_created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "active_access_token" VARCHAR,
    "active_refresh_token" VARCHAR,
    "additional_phone_extension" TEXT,
    "additional_phone_number" TEXT,
    "additional_phone_number_type" TEXT,
    "address_snapshot_id" UUID,
    "agency_id" UUID,
    "agreed_to_terms_of_service" BOOLEAN NOT NULL DEFAULT false,
    "confirmation_token" VARCHAR,
    "confirmed_at" TIMESTAMPTZ(6),
    "dob" TIMESTAMP(6),
    "email" VARCHAR NOT NULL,
    "failed_login_attempts_count" INTEGER NOT NULL DEFAULT 0,
    "first_name" VARCHAR NOT NULL,
    "hit_confirmation_url" TIMESTAMPTZ(6),
    "is_advocate" BOOLEAN NOT NULL DEFAULT false,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "language" "languages_enum",
    "last_login_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_name" VARCHAR NOT NULL,
    "mfa_enabled" BOOLEAN NOT NULL DEFAULT false,
    "middle_name" VARCHAR,
    "password_hash" VARCHAR NOT NULL,
    "password_updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "password_valid_for_days" INTEGER NOT NULL DEFAULT 365,
    "phone_extension" TEXT,
    "phone_number" VARCHAR,
    "phone_number_verified" BOOLEAN DEFAULT false,
    "phone_type" TEXT,
    "reset_token" VARCHAR,
    "single_use_code" VARCHAR,
    "single_use_code_updated_at" TIMESTAMPTZ(6),
    "title" TEXT,
    "was_warned_of_deletion" BOOLEAN DEFAULT false,

    CONSTRAINT "user_account_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "favorite_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "send_email_notifications" BOOLEAN NOT NULL DEFAULT false,
    "send_sms_notifications" BOOLEAN NOT NULL DEFAULT false,
    "user_id" UUID NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "is_jurisdictional_admin" BOOLEAN NOT NULL DEFAULT false,
    "is_limited_jurisdictional_admin" BOOLEAN NOT NULL DEFAULT false,
    "is_partner" BOOLEAN NOT NULL DEFAULT false,
    "is_super_admin" BOOLEAN NOT NULL DEFAULT false,
    "is_support_admin" BOOLEAN NOT NULL DEFAULT false,
    "user_id" UUID NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "user_role_snapshot" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "is_jurisdictional_admin" BOOLEAN NOT NULL DEFAULT false,
    "is_limited_jurisdictional_admin" BOOLEAN NOT NULL DEFAULT false,
    "is_partner" BOOLEAN NOT NULL DEFAULT false,
    "is_super_admin" BOOLEAN NOT NULL DEFAULT false,
    "is_support_admin" BOOLEAN NOT NULL DEFAULT false,
    "user_snapshot_id" UUID NOT NULL,

    CONSTRAINT "user_role_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ApplicationFlaggedSetToApplications" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_ApplicationFlaggedSetToApplications_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ApplicationsToUnitTypes" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_ApplicationsToUnitTypes_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ApplicationSnapshotToUnitTypes" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_ApplicationSnapshotToUnitTypes_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_FeatureFlagsToJurisdictions" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_FeatureFlagsToJurisdictions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_JurisdictionsToUserAccounts" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_JurisdictionsToUserAccounts_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_JurisdictionsToUserAccountSnapshot" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_JurisdictionsToUserAccountSnapshot_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_favorite_listings" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_favorite_listings_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ListingsToUserAccounts" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_ListingsToUserAccounts_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ListingsToUserPreferences" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_ListingsToUserPreferences_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ListingSnapshotToUserAccountSnapshot" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_ListingSnapshotToUserAccountSnapshot_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_UnitGroupToUnitTypes" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_UnitGroupToUnitTypes_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_UnitGroupSnapshotToUnitTypes" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_UnitGroupSnapshotToUnitTypes_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "alternate_contact_mailing_address_id_key" ON "alternate_contact"("mailing_address_id");

-- CreateIndex
CREATE UNIQUE INDEX "alternate_contact_snapshot_snapshot_mailing_address_snapsho_key" ON "alternate_contact_snapshot_snapshot"("mailing_address_snapshot_id");

-- CreateIndex
CREATE UNIQUE INDEX "applicant_address_id_key" ON "applicant"("address_id");

-- CreateIndex
CREATE UNIQUE INDEX "applicant_work_address_id_key" ON "applicant"("work_address_id");

-- CreateIndex
CREATE UNIQUE INDEX "applicant_snapshot_address_snapshot_id_key" ON "applicant_snapshot"("address_snapshot_id");

-- CreateIndex
CREATE UNIQUE INDEX "applicant_snapshot_work_address_snapshot_id_key" ON "applicant_snapshot"("work_address_snapshot_id");

-- CreateIndex
CREATE INDEX "application_flagged_set_listing_id_idx" ON "application_flagged_set"("listing_id");

-- CreateIndex
CREATE UNIQUE INDEX "application_flagged_set_rule_key_listing_id_key" ON "application_flagged_set"("rule_key", "listing_id");

-- CreateIndex
CREATE INDEX "application_lottery_positions_listing_id_idx" ON "application_lottery_positions"("listing_id");

-- CreateIndex
CREATE INDEX "application_lottery_positions_application_id_idx" ON "application_lottery_positions"("application_id");

-- CreateIndex
CREATE INDEX "application_lottery_totals_listing_id_idx" ON "application_lottery_totals"("listing_id");

-- CreateIndex
CREATE UNIQUE INDEX "applications_accessibility_id_key" ON "applications"("accessibility_id");

-- CreateIndex
CREATE UNIQUE INDEX "applications_alternate_address_id_key" ON "applications"("alternate_address_id");

-- CreateIndex
CREATE UNIQUE INDEX "applications_alternate_contact_id_key" ON "applications"("alternate_contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "applications_applicant_id_key" ON "applications"("applicant_id");

-- CreateIndex
CREATE UNIQUE INDEX "applications_demographics_id_key" ON "applications"("demographics_id");

-- CreateIndex
CREATE UNIQUE INDEX "applications_mailing_address_id_key" ON "applications"("mailing_address_id");

-- CreateIndex
CREATE INDEX "applications_listing_id_idx" ON "applications"("listing_id");

-- CreateIndex
CREATE INDEX "applications_user_id_idx" ON "applications"("user_id");

-- CreateIndex
CREATE INDEX "applications_is_newest_idx" ON "applications"("is_newest");

-- CreateIndex
CREATE UNIQUE INDEX "applications_listing_id_confirmation_code_key" ON "applications"("listing_id", "confirmation_code");

-- CreateIndex
CREATE UNIQUE INDEX "application_snapshot_accessibility_snapshot_id_key" ON "application_snapshot"("accessibility_snapshot_id");

-- CreateIndex
CREATE UNIQUE INDEX "application_snapshot_alternate_address_snapshot_id_key" ON "application_snapshot"("alternate_address_snapshot_id");

-- CreateIndex
CREATE UNIQUE INDEX "application_snapshot_alternate_contact_snapshot_id_key" ON "application_snapshot"("alternate_contact_snapshot_id");

-- CreateIndex
CREATE UNIQUE INDEX "application_snapshot_applicant_snapshot_id_key" ON "application_snapshot"("applicant_snapshot_id");

-- CreateIndex
CREATE UNIQUE INDEX "application_snapshot_demographic_snapshot_id_key" ON "application_snapshot"("demographic_snapshot_id");

-- CreateIndex
CREATE UNIQUE INDEX "application_snapshot_mailing_address_snapshot_id_key" ON "application_snapshot"("mailing_address_snapshot_id");

-- CreateIndex
CREATE INDEX "application_snapshot_listing_id_idx" ON "application_snapshot"("listing_id");

-- CreateIndex
CREATE INDEX "application_snapshot_user_id_idx" ON "application_snapshot"("user_id");

-- CreateIndex
CREATE INDEX "application_snapshot_is_newest_idx" ON "application_snapshot"("is_newest");

-- CreateIndex
CREATE UNIQUE INDEX "application_snapshot_listing_id_confirmation_code_key" ON "application_snapshot"("listing_id", "confirmation_code");

-- CreateIndex
CREATE UNIQUE INDEX "application_selection_options_address_holder_address_id_key" ON "application_selection_options"("address_holder_address_id");

-- CreateIndex
CREATE UNIQUE INDEX "application_selection_option_snapshot_address_holder_addres_key" ON "application_selection_option_snapshot"("address_holder_address_snapshot_id");

-- CreateIndex
CREATE UNIQUE INDEX "cron_job_name_key" ON "cron_job"("name");

-- CreateIndex
CREATE UNIQUE INDEX "feature_flags_name_key" ON "feature_flags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "household_member_address_id_key" ON "household_member"("address_id");

-- CreateIndex
CREATE UNIQUE INDEX "household_member_work_address_id_key" ON "household_member"("work_address_id");

-- CreateIndex
CREATE INDEX "household_member_application_id_idx" ON "household_member"("application_id");

-- CreateIndex
CREATE UNIQUE INDEX "household_member_snapshot_address_snapshot_id_key" ON "household_member_snapshot"("address_snapshot_id");

-- CreateIndex
CREATE UNIQUE INDEX "household_member_snapshot_work_address_snapshot_id_key" ON "household_member_snapshot"("work_address_snapshot_id");

-- CreateIndex
CREATE INDEX "household_member_snapshot_application_snapshot_id_idx" ON "household_member_snapshot"("application_snapshot_id");

-- CreateIndex
CREATE UNIQUE INDEX "jurisdictions_name_key" ON "jurisdictions"("name");

-- CreateIndex
CREATE INDEX "listing_images_listing_id_idx" ON "listing_images"("listing_id");

-- CreateIndex
CREATE INDEX "listing_image_snapshot_listing_snapshot_id_idx" ON "listing_image_snapshot"("listing_snapshot_id");

-- CreateIndex
CREATE UNIQUE INDEX "listings_documents_id_key" ON "listings"("documents_id");

-- CreateIndex
CREATE UNIQUE INDEX "listings_features_id_key" ON "listings"("features_id");

-- CreateIndex
CREATE UNIQUE INDEX "listings_neighborhood_amenities_id_key" ON "listings"("neighborhood_amenities_id");

-- CreateIndex
CREATE UNIQUE INDEX "listings_parking_type_id_key" ON "listings"("parking_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "listings_utilities_id_key" ON "listings"("utilities_id");

-- CreateIndex
CREATE INDEX "listings_jurisdiction_id_idx" ON "listings"("jurisdiction_id");

-- CreateIndex
CREATE UNIQUE INDEX "listing_snapshot_document_snapshot_id_key" ON "listing_snapshot"("document_snapshot_id");

-- CreateIndex
CREATE UNIQUE INDEX "listing_snapshot_feature_snapshot_id_key" ON "listing_snapshot"("feature_snapshot_id");

-- CreateIndex
CREATE UNIQUE INDEX "listing_snapshot_neighborhood_amenity_snapshot_id_key" ON "listing_snapshot"("neighborhood_amenity_snapshot_id");

-- CreateIndex
CREATE UNIQUE INDEX "listing_snapshot_utility_snapshot_id_key" ON "listing_snapshot"("utility_snapshot_id");

-- CreateIndex
CREATE INDEX "listing_snapshot_jurisdiction_id_idx" ON "listing_snapshot"("jurisdiction_id");

-- CreateIndex
CREATE INDEX "properties_id_idx" ON "properties"("id");

-- CreateIndex
CREATE INDEX "properties_name_idx" ON "properties"("name");

-- CreateIndex
CREATE INDEX "property_snapshot_id_idx" ON "property_snapshot"("id");

-- CreateIndex
CREATE INDEX "property_snapshot_name_idx" ON "property_snapshot"("name");

-- CreateIndex
CREATE UNIQUE INDEX "script_runs_script_name_key" ON "script_runs"("script_name");

-- CreateIndex
CREATE UNIQUE INDEX "translations_jurisdiction_id_language_key" ON "translations"("jurisdiction_id", "language");

-- CreateIndex
CREATE UNIQUE INDEX "units_ami_chart_override_id_key" ON "units"("ami_chart_override_id");

-- CreateIndex
CREATE UNIQUE INDEX "unit_snapshot_ami_chart_override_snapshot_id_key" ON "unit_snapshot"("ami_chart_override_snapshot_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_accounts_email_key" ON "user_accounts"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_account_snapshot_email_key" ON "user_account_snapshot"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_user_id_key" ON "user_preferences"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_role_snapshot_user_snapshot_id_key" ON "user_role_snapshot"("user_snapshot_id");

-- CreateIndex
CREATE INDEX "_ApplicationFlaggedSetToApplications_B_index" ON "_ApplicationFlaggedSetToApplications"("B");

-- CreateIndex
CREATE INDEX "_ApplicationsToUnitTypes_B_index" ON "_ApplicationsToUnitTypes"("B");

-- CreateIndex
CREATE INDEX "_ApplicationSnapshotToUnitTypes_B_index" ON "_ApplicationSnapshotToUnitTypes"("B");

-- CreateIndex
CREATE INDEX "_FeatureFlagsToJurisdictions_B_index" ON "_FeatureFlagsToJurisdictions"("B");

-- CreateIndex
CREATE INDEX "_JurisdictionsToUserAccounts_B_index" ON "_JurisdictionsToUserAccounts"("B");

-- CreateIndex
CREATE INDEX "_JurisdictionsToUserAccountSnapshot_B_index" ON "_JurisdictionsToUserAccountSnapshot"("B");

-- CreateIndex
CREATE INDEX "_favorite_listings_B_index" ON "_favorite_listings"("B");

-- CreateIndex
CREATE INDEX "_ListingsToUserAccounts_B_index" ON "_ListingsToUserAccounts"("B");

-- CreateIndex
CREATE INDEX "_ListingsToUserPreferences_B_index" ON "_ListingsToUserPreferences"("B");

-- CreateIndex
CREATE INDEX "_ListingSnapshotToUserAccountSnapshot_B_index" ON "_ListingSnapshotToUserAccountSnapshot"("B");

-- CreateIndex
CREATE INDEX "_UnitGroupToUnitTypes_B_index" ON "_UnitGroupToUnitTypes"("B");

-- CreateIndex
CREATE INDEX "_UnitGroupSnapshotToUnitTypes_B_index" ON "_UnitGroupSnapshotToUnitTypes"("B");

-- AddForeignKey
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_accounts"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "agency" ADD CONSTRAINT "agency_jurisdictions_id_fkey" FOREIGN KEY ("jurisdictions_id") REFERENCES "jurisdictions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "alternate_contact" ADD CONSTRAINT "alternate_contact_mailing_address_id_fkey" FOREIGN KEY ("mailing_address_id") REFERENCES "address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "alternate_contact_snapshot_snapshot" ADD CONSTRAINT "alternate_contact_snapshot_snapshot_mailing_address_snapsh_fkey" FOREIGN KEY ("mailing_address_snapshot_id") REFERENCES "address_snapshot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ami_chart" ADD CONSTRAINT "ami_chart_jurisdiction_id_fkey" FOREIGN KEY ("jurisdiction_id") REFERENCES "jurisdictions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "applicant" ADD CONSTRAINT "applicant_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "applicant" ADD CONSTRAINT "applicant_work_address_id_fkey" FOREIGN KEY ("work_address_id") REFERENCES "address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "applicant_snapshot" ADD CONSTRAINT "applicant_snapshot_address_snapshot_id_fkey" FOREIGN KEY ("address_snapshot_id") REFERENCES "address_snapshot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "applicant_snapshot" ADD CONSTRAINT "applicant_snapshot_work_address_snapshot_id_fkey" FOREIGN KEY ("work_address_snapshot_id") REFERENCES "address_snapshot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "application_flagged_set" ADD CONSTRAINT "application_flagged_set_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "application_flagged_set" ADD CONSTRAINT "application_flagged_set_resolving_user_id_fkey" FOREIGN KEY ("resolving_user_id") REFERENCES "user_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "application_lottery_positions" ADD CONSTRAINT "application_lottery_positions_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "application_lottery_positions" ADD CONSTRAINT "application_lottery_positions_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "application_lottery_positions" ADD CONSTRAINT "application_lottery_positions_multiselect_question_id_fkey" FOREIGN KEY ("multiselect_question_id") REFERENCES "multiselect_questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "application_lottery_totals" ADD CONSTRAINT "application_lottery_totals_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "application_lottery_totals" ADD CONSTRAINT "application_lottery_totals_multiselect_question_id_fkey" FOREIGN KEY ("multiselect_question_id") REFERENCES "multiselect_questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "application_methods" ADD CONSTRAINT "application_methods_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "application_method_snapshot" ADD CONSTRAINT "application_method_snapshot_listing_snapshot_id_fkey" FOREIGN KEY ("listing_snapshot_id") REFERENCES "listing_snapshot"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_accessibility_id_fkey" FOREIGN KEY ("accessibility_id") REFERENCES "accessibility"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_alternate_contact_id_fkey" FOREIGN KEY ("alternate_contact_id") REFERENCES "alternate_contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_applicant_id_fkey" FOREIGN KEY ("applicant_id") REFERENCES "applicant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_alternate_address_id_fkey" FOREIGN KEY ("alternate_address_id") REFERENCES "address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_mailing_address_id_fkey" FOREIGN KEY ("mailing_address_id") REFERENCES "address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_demographics_id_fkey" FOREIGN KEY ("demographics_id") REFERENCES "demographics"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_accounts"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "application_snapshot" ADD CONSTRAINT "application_snapshot_accessibility_snapshot_id_fkey" FOREIGN KEY ("accessibility_snapshot_id") REFERENCES "accessibility_snapshot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "application_snapshot" ADD CONSTRAINT "application_snapshot_alternate_contact_snapshot_id_fkey" FOREIGN KEY ("alternate_contact_snapshot_id") REFERENCES "alternate_contact_snapshot_snapshot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "application_snapshot" ADD CONSTRAINT "application_snapshot_applicant_snapshot_id_fkey" FOREIGN KEY ("applicant_snapshot_id") REFERENCES "applicant_snapshot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "application_snapshot" ADD CONSTRAINT "application_snapshot_alternate_address_snapshot_id_fkey" FOREIGN KEY ("alternate_address_snapshot_id") REFERENCES "address_snapshot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "application_snapshot" ADD CONSTRAINT "application_snapshot_mailing_address_snapshot_id_fkey" FOREIGN KEY ("mailing_address_snapshot_id") REFERENCES "address_snapshot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "application_snapshot" ADD CONSTRAINT "application_snapshot_demographic_snapshot_id_fkey" FOREIGN KEY ("demographic_snapshot_id") REFERENCES "demographic_snapshot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "application_selection_options" ADD CONSTRAINT "application_selection_options_address_holder_address_id_fkey" FOREIGN KEY ("address_holder_address_id") REFERENCES "address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "application_selection_options" ADD CONSTRAINT "application_selection_options_application_selection_id_fkey" FOREIGN KEY ("application_selection_id") REFERENCES "application_selections"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "application_selection_options" ADD CONSTRAINT "application_selection_options_multiselect_option_id_fkey" FOREIGN KEY ("multiselect_option_id") REFERENCES "multiselect_options"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "application_selection_option_snapshot" ADD CONSTRAINT "application_selection_option_snapshot_address_holder_addre_fkey" FOREIGN KEY ("address_holder_address_snapshot_id") REFERENCES "address_snapshot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "application_selection_option_snapshot" ADD CONSTRAINT "application_selection_option_snapshot_application_selectio_fkey" FOREIGN KEY ("application_selection_snapshot_id") REFERENCES "application_selection_snapshot"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "application_selection_option_snapshot" ADD CONSTRAINT "application_selection_option_snapshot_multiselect_option_i_fkey" FOREIGN KEY ("multiselect_option_id") REFERENCES "multiselect_options"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "application_selections" ADD CONSTRAINT "application_selections_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "application_selections" ADD CONSTRAINT "application_selections_multiselect_question_id_fkey" FOREIGN KEY ("multiselect_question_id") REFERENCES "multiselect_questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "application_selection_snapshot" ADD CONSTRAINT "application_selection_snapshot_application_snapshot_id_fkey" FOREIGN KEY ("application_snapshot_id") REFERENCES "application_snapshot"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "application_selection_snapshot" ADD CONSTRAINT "application_selection_snapshot_multiselect_question_id_fkey" FOREIGN KEY ("multiselect_question_id") REFERENCES "multiselect_questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "household_member" ADD CONSTRAINT "household_member_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "household_member" ADD CONSTRAINT "household_member_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "household_member" ADD CONSTRAINT "household_member_work_address_id_fkey" FOREIGN KEY ("work_address_id") REFERENCES "address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "household_member_snapshot" ADD CONSTRAINT "household_member_snapshot_application_snapshot_id_fkey" FOREIGN KEY ("application_snapshot_id") REFERENCES "application_snapshot"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "household_member_snapshot" ADD CONSTRAINT "household_member_snapshot_address_snapshot_id_fkey" FOREIGN KEY ("address_snapshot_id") REFERENCES "address_snapshot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "household_member_snapshot" ADD CONSTRAINT "household_member_snapshot_work_address_snapshot_id_fkey" FOREIGN KEY ("work_address_snapshot_id") REFERENCES "address_snapshot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listing_events" ADD CONSTRAINT "listing_events_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "assets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listing_events" ADD CONSTRAINT "listing_events_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listing_event_snapshot" ADD CONSTRAINT "listing_event_snapshot_file_snapshot_id_fkey" FOREIGN KEY ("file_snapshot_id") REFERENCES "asset_snapshot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listing_event_snapshot" ADD CONSTRAINT "listing_event_snapshot_listing_snapshot_id_fkey" FOREIGN KEY ("listing_snapshot_id") REFERENCES "listing_snapshot"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listing_images" ADD CONSTRAINT "listing_images_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "assets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listing_images" ADD CONSTRAINT "listing_images_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listing_image_snapshot" ADD CONSTRAINT "listing_image_snapshot_image_snapshot_id_fkey" FOREIGN KEY ("image_snapshot_id") REFERENCES "asset_snapshot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listing_image_snapshot" ADD CONSTRAINT "listing_image_snapshot_listing_snapshot_id_fkey" FOREIGN KEY ("listing_snapshot_id") REFERENCES "listing_snapshot"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listing_multiselect_questions" ADD CONSTRAINT "listing_multiselect_questions_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listing_multiselect_questions" ADD CONSTRAINT "listing_multiselect_questions_multiselect_question_id_fkey" FOREIGN KEY ("multiselect_question_id") REFERENCES "multiselect_questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listing_multiselect_question_snapshot" ADD CONSTRAINT "listing_multiselect_question_snapshot_listing_snapshot_id_fkey" FOREIGN KEY ("listing_snapshot_id") REFERENCES "listing_snapshot"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listing_multiselect_question_snapshot" ADD CONSTRAINT "listing_multiselect_question_snapshot_multiselect_question_fkey" FOREIGN KEY ("multiselect_question_id") REFERENCES "multiselect_questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_copy_of_id_fkey" FOREIGN KEY ("copy_of_id") REFERENCES "listings"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_jurisdiction_id_fkey" FOREIGN KEY ("jurisdiction_id") REFERENCES "jurisdictions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_last_updated_by_user_id_fkey" FOREIGN KEY ("last_updated_by_user_id") REFERENCES "user_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_features_id_fkey" FOREIGN KEY ("features_id") REFERENCES "listing_features"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_neighborhood_amenities_id_fkey" FOREIGN KEY ("neighborhood_amenities_id") REFERENCES "listing_neighborhood_amenities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_accessible_marketing_flyer_file_id_fkey" FOREIGN KEY ("accessible_marketing_flyer_file_id") REFERENCES "assets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_application_drop_off_address_id_fkey" FOREIGN KEY ("application_drop_off_address_id") REFERENCES "address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_application_mailing_address_id_fkey" FOREIGN KEY ("application_mailing_address_id") REFERENCES "address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_application_pick_up_address_id_fkey" FOREIGN KEY ("application_pick_up_address_id") REFERENCES "address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_building_address_id_fkey" FOREIGN KEY ("building_address_id") REFERENCES "address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_building_selection_criteria_file_id_fkey" FOREIGN KEY ("building_selection_criteria_file_id") REFERENCES "assets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_leasing_agent_address_id_fkey" FOREIGN KEY ("leasing_agent_address_id") REFERENCES "address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_marketing_flyer_file_id_fkey" FOREIGN KEY ("marketing_flyer_file_id") REFERENCES "assets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_result_id_fkey" FOREIGN KEY ("result_id") REFERENCES "assets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_utilities_id_fkey" FOREIGN KEY ("utilities_id") REFERENCES "listing_utilities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_parking_type_id_fkey" FOREIGN KEY ("parking_type_id") REFERENCES "listing_parking_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_requested_changes_user_id_fkey" FOREIGN KEY ("requested_changes_user_id") REFERENCES "user_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_documents_id_fkey" FOREIGN KEY ("documents_id") REFERENCES "listing_documents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_reserved_community_type_id_fkey" FOREIGN KEY ("reserved_community_type_id") REFERENCES "reserved_community_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listing_snapshot" ADD CONSTRAINT "listing_snapshot_jurisdiction_id_fkey" FOREIGN KEY ("jurisdiction_id") REFERENCES "jurisdictions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listing_snapshot" ADD CONSTRAINT "listing_snapshot_feature_snapshot_id_fkey" FOREIGN KEY ("feature_snapshot_id") REFERENCES "listing_feature_snapshot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listing_snapshot" ADD CONSTRAINT "listing_snapshot_neighborhood_amenity_snapshot_id_fkey" FOREIGN KEY ("neighborhood_amenity_snapshot_id") REFERENCES "listing_neighborhood_amenity_snapshot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listing_snapshot" ADD CONSTRAINT "listing_snapshot_accessible_marketing_flyer_file_snapshot__fkey" FOREIGN KEY ("accessible_marketing_flyer_file_snapshot_id") REFERENCES "asset_snapshot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listing_snapshot" ADD CONSTRAINT "listing_snapshot_application_drop_off_address_snapshot_id_fkey" FOREIGN KEY ("application_drop_off_address_snapshot_id") REFERENCES "address_snapshot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listing_snapshot" ADD CONSTRAINT "listing_snapshot_application_mailing_address_snapshot_id_fkey" FOREIGN KEY ("application_mailing_address_snapshot_id") REFERENCES "address_snapshot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listing_snapshot" ADD CONSTRAINT "listing_snapshot_application_pick_up_address_snapshot_id_fkey" FOREIGN KEY ("application_pick_up_address_snapshot_id") REFERENCES "address_snapshot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listing_snapshot" ADD CONSTRAINT "listing_snapshot_building_address_snapshot_id_fkey" FOREIGN KEY ("building_address_snapshot_id") REFERENCES "address_snapshot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listing_snapshot" ADD CONSTRAINT "listing_snapshot_building_selection_criteria_file_snapshot_fkey" FOREIGN KEY ("building_selection_criteria_file_snapshot_id") REFERENCES "asset_snapshot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listing_snapshot" ADD CONSTRAINT "listing_snapshot_leasing_agent_address_snapshot_id_fkey" FOREIGN KEY ("leasing_agent_address_snapshot_id") REFERENCES "address_snapshot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listing_snapshot" ADD CONSTRAINT "listing_snapshot_marketing_flyer_file_snapshot_id_fkey" FOREIGN KEY ("marketing_flyer_file_snapshot_id") REFERENCES "asset_snapshot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listing_snapshot" ADD CONSTRAINT "listing_snapshot_result_snapshot_id_fkey" FOREIGN KEY ("result_snapshot_id") REFERENCES "asset_snapshot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listing_snapshot" ADD CONSTRAINT "listing_snapshot_utility_snapshot_id_fkey" FOREIGN KEY ("utility_snapshot_id") REFERENCES "listing_utility_snapshot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listing_snapshot" ADD CONSTRAINT "listing_snapshot_property_snapshot_id_fkey" FOREIGN KEY ("property_snapshot_id") REFERENCES "property_snapshot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_snapshot" ADD CONSTRAINT "listing_snapshot_document_snapshot_id_fkey" FOREIGN KEY ("document_snapshot_id") REFERENCES "listing_document_snapshot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listing_snapshot" ADD CONSTRAINT "listing_snapshot_reserved_community_type_id_fkey" FOREIGN KEY ("reserved_community_type_id") REFERENCES "reserved_community_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "multiselect_options" ADD CONSTRAINT "multiselect_options_multiselect_question_id_fkey" FOREIGN KEY ("multiselect_question_id") REFERENCES "multiselect_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "multiselect_questions" ADD CONSTRAINT "multiselect_questions_jurisdiction_id_fkey" FOREIGN KEY ("jurisdiction_id") REFERENCES "jurisdictions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "paper_applications" ADD CONSTRAINT "paper_applications_application_method_id_fkey" FOREIGN KEY ("application_method_id") REFERENCES "application_methods"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "paper_applications" ADD CONSTRAINT "paper_applications_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "paper_application_snapshot" ADD CONSTRAINT "paper_application_snapshot_application_method_snapshot_id_fkey" FOREIGN KEY ("application_method_snapshot_id") REFERENCES "application_method_snapshot"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "paper_application_snapshot" ADD CONSTRAINT "paper_application_snapshot_file_snapshot_id_fkey" FOREIGN KEY ("file_snapshot_id") REFERENCES "asset_snapshot"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_jurisdiction_id_fkey" FOREIGN KEY ("jurisdiction_id") REFERENCES "jurisdictions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "property_snapshot" ADD CONSTRAINT "property_snapshot_jurisdiction_id_fkey" FOREIGN KEY ("jurisdiction_id") REFERENCES "jurisdictions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reserved_community_types" ADD CONSTRAINT "reserved_community_types_jurisdiction_id_fkey" FOREIGN KEY ("jurisdiction_id") REFERENCES "jurisdictions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "translations" ADD CONSTRAINT "translations_jurisdiction_id_fkey" FOREIGN KEY ("jurisdiction_id") REFERENCES "jurisdictions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "unit_group" ADD CONSTRAINT "unit_group_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "unit_group" ADD CONSTRAINT "unit_group_priority_type_id_fkey" FOREIGN KEY ("priority_type_id") REFERENCES "unit_accessibility_priority_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "unit_group_snapshot" ADD CONSTRAINT "unit_group_snapshot_listing_snapshot_id_fkey" FOREIGN KEY ("listing_snapshot_id") REFERENCES "listing_snapshot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "unit_group_snapshot" ADD CONSTRAINT "unit_group_snapshot_priority_type_id_fkey" FOREIGN KEY ("priority_type_id") REFERENCES "unit_accessibility_priority_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "unit_group_ami_levels" ADD CONSTRAINT "unit_group_ami_levels_unit_group_id_fkey" FOREIGN KEY ("unit_group_id") REFERENCES "unit_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "unit_group_ami_levels" ADD CONSTRAINT "unit_group_ami_levels_ami_chart_id_fkey" FOREIGN KEY ("ami_chart_id") REFERENCES "ami_chart"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "unit_group_ami_level_snapshot" ADD CONSTRAINT "unit_group_ami_level_snapshot_unit_group_snapshot_id_fkey" FOREIGN KEY ("unit_group_snapshot_id") REFERENCES "unit_group_snapshot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "unit_group_ami_level_snapshot" ADD CONSTRAINT "unit_group_ami_level_snapshot_ami_chart_id_fkey" FOREIGN KEY ("ami_chart_id") REFERENCES "ami_chart"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_ami_chart_id_fkey" FOREIGN KEY ("ami_chart_id") REFERENCES "ami_chart"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_priority_type_id_fkey" FOREIGN KEY ("priority_type_id") REFERENCES "unit_accessibility_priority_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_ami_chart_override_id_fkey" FOREIGN KEY ("ami_chart_override_id") REFERENCES "unit_ami_chart_overrides"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_unit_rent_type_id_fkey" FOREIGN KEY ("unit_rent_type_id") REFERENCES "unit_rent_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_unit_type_id_fkey" FOREIGN KEY ("unit_type_id") REFERENCES "unit_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "unit_snapshot" ADD CONSTRAINT "unit_snapshot_ami_chart_id_fkey" FOREIGN KEY ("ami_chart_id") REFERENCES "ami_chart"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "unit_snapshot" ADD CONSTRAINT "unit_snapshot_listing_snapshot_id_fkey" FOREIGN KEY ("listing_snapshot_id") REFERENCES "listing_snapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_snapshot" ADD CONSTRAINT "unit_snapshot_priority_type_id_fkey" FOREIGN KEY ("priority_type_id") REFERENCES "unit_accessibility_priority_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "unit_snapshot" ADD CONSTRAINT "unit_snapshot_ami_chart_override_snapshot_id_fkey" FOREIGN KEY ("ami_chart_override_snapshot_id") REFERENCES "unit_ami_chart_override_snapshot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "unit_snapshot" ADD CONSTRAINT "unit_snapshot_unit_rent_type_id_fkey" FOREIGN KEY ("unit_rent_type_id") REFERENCES "unit_rent_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "unit_snapshot" ADD CONSTRAINT "unit_snapshot_unit_type_id_fkey" FOREIGN KEY ("unit_type_id") REFERENCES "unit_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "units_summary" ADD CONSTRAINT "units_summary_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "units_summary" ADD CONSTRAINT "units_summary_priority_type_id_fkey" FOREIGN KEY ("priority_type_id") REFERENCES "unit_accessibility_priority_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "units_summary" ADD CONSTRAINT "units_summary_unit_type_id_fkey" FOREIGN KEY ("unit_type_id") REFERENCES "unit_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "units_summary_snapshot" ADD CONSTRAINT "units_summary_snapshot_listing_snapshot_id_fkey" FOREIGN KEY ("listing_snapshot_id") REFERENCES "listing_snapshot"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "units_summary_snapshot" ADD CONSTRAINT "units_summary_snapshot_priority_type_id_fkey" FOREIGN KEY ("priority_type_id") REFERENCES "unit_accessibility_priority_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "units_summary_snapshot" ADD CONSTRAINT "units_summary_snapshot_unit_type_id_fkey" FOREIGN KEY ("unit_type_id") REFERENCES "unit_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_accounts" ADD CONSTRAINT "user_accounts_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_accounts" ADD CONSTRAINT "user_accounts_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agency"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_account_snapshot" ADD CONSTRAINT "user_account_snapshot_address_snapshot_id_fkey" FOREIGN KEY ("address_snapshot_id") REFERENCES "address_snapshot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_account_snapshot" ADD CONSTRAINT "user_account_snapshot_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agency"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role_snapshot" ADD CONSTRAINT "user_role_snapshot_user_snapshot_id_fkey" FOREIGN KEY ("user_snapshot_id") REFERENCES "user_account_snapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApplicationFlaggedSetToApplications" ADD CONSTRAINT "_ApplicationFlaggedSetToApplications_A_fkey" FOREIGN KEY ("A") REFERENCES "application_flagged_set"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApplicationFlaggedSetToApplications" ADD CONSTRAINT "_ApplicationFlaggedSetToApplications_B_fkey" FOREIGN KEY ("B") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApplicationsToUnitTypes" ADD CONSTRAINT "_ApplicationsToUnitTypes_A_fkey" FOREIGN KEY ("A") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApplicationsToUnitTypes" ADD CONSTRAINT "_ApplicationsToUnitTypes_B_fkey" FOREIGN KEY ("B") REFERENCES "unit_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApplicationSnapshotToUnitTypes" ADD CONSTRAINT "_ApplicationSnapshotToUnitTypes_A_fkey" FOREIGN KEY ("A") REFERENCES "application_snapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApplicationSnapshotToUnitTypes" ADD CONSTRAINT "_ApplicationSnapshotToUnitTypes_B_fkey" FOREIGN KEY ("B") REFERENCES "unit_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FeatureFlagsToJurisdictions" ADD CONSTRAINT "_FeatureFlagsToJurisdictions_A_fkey" FOREIGN KEY ("A") REFERENCES "feature_flags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FeatureFlagsToJurisdictions" ADD CONSTRAINT "_FeatureFlagsToJurisdictions_B_fkey" FOREIGN KEY ("B") REFERENCES "jurisdictions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JurisdictionsToUserAccounts" ADD CONSTRAINT "_JurisdictionsToUserAccounts_A_fkey" FOREIGN KEY ("A") REFERENCES "jurisdictions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JurisdictionsToUserAccounts" ADD CONSTRAINT "_JurisdictionsToUserAccounts_B_fkey" FOREIGN KEY ("B") REFERENCES "user_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JurisdictionsToUserAccountSnapshot" ADD CONSTRAINT "_JurisdictionsToUserAccountSnapshot_A_fkey" FOREIGN KEY ("A") REFERENCES "jurisdictions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JurisdictionsToUserAccountSnapshot" ADD CONSTRAINT "_JurisdictionsToUserAccountSnapshot_B_fkey" FOREIGN KEY ("B") REFERENCES "user_account_snapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_favorite_listings" ADD CONSTRAINT "_favorite_listings_A_fkey" FOREIGN KEY ("A") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_favorite_listings" ADD CONSTRAINT "_favorite_listings_B_fkey" FOREIGN KEY ("B") REFERENCES "user_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ListingsToUserAccounts" ADD CONSTRAINT "_ListingsToUserAccounts_A_fkey" FOREIGN KEY ("A") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ListingsToUserAccounts" ADD CONSTRAINT "_ListingsToUserAccounts_B_fkey" FOREIGN KEY ("B") REFERENCES "user_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ListingsToUserPreferences" ADD CONSTRAINT "_ListingsToUserPreferences_A_fkey" FOREIGN KEY ("A") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ListingsToUserPreferences" ADD CONSTRAINT "_ListingsToUserPreferences_B_fkey" FOREIGN KEY ("B") REFERENCES "user_preferences"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ListingSnapshotToUserAccountSnapshot" ADD CONSTRAINT "_ListingSnapshotToUserAccountSnapshot_A_fkey" FOREIGN KEY ("A") REFERENCES "listing_snapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ListingSnapshotToUserAccountSnapshot" ADD CONSTRAINT "_ListingSnapshotToUserAccountSnapshot_B_fkey" FOREIGN KEY ("B") REFERENCES "user_account_snapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UnitGroupToUnitTypes" ADD CONSTRAINT "_UnitGroupToUnitTypes_A_fkey" FOREIGN KEY ("A") REFERENCES "unit_group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UnitGroupToUnitTypes" ADD CONSTRAINT "_UnitGroupToUnitTypes_B_fkey" FOREIGN KEY ("B") REFERENCES "unit_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UnitGroupSnapshotToUnitTypes" ADD CONSTRAINT "_UnitGroupSnapshotToUnitTypes_A_fkey" FOREIGN KEY ("A") REFERENCES "unit_group_snapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UnitGroupSnapshotToUnitTypes" ADD CONSTRAINT "_UnitGroupSnapshotToUnitTypes_B_fkey" FOREIGN KEY ("B") REFERENCES "unit_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;
