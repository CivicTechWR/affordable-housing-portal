import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface FormSectionProps {
  title: string;
  description?: string;
  isSeparated?: boolean;
  children: ReactNode;
}

export function FormSection({ title, description, isSeparated, children }: FormSectionProps) {
  return (
    <div className={isSeparated ? "pt-6 border-t mt-8" : undefined}>
      <h3 className="text-lg font-medium">{title}</h3>
      {description && <p className="mb-4 text-sm text-muted-foreground">{description}</p>}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">{children}</div>
    </div>
  );
}

export interface ListingFormLayoutProps {
  formPaneHeader?: ReactNode;
  previewPaneHeader?: ReactNode;
  dividerControl?: ReactNode;
  formContent: ReactNode;
  previewContent?: ReactNode;
  footer?: ReactNode;
  isPreviewExpanded?: boolean;
}

export function ListingFormLayout({
  formPaneHeader,
  previewPaneHeader,
  dividerControl,
  formContent,
  previewContent,
  footer,
  isPreviewExpanded = false,
}: ListingFormLayoutProps) {
  const isExpandedWithPreview = isPreviewExpanded && Boolean(previewContent);

  return (
    <div className="w-full">
      <div
        className={cn(
          "grid grid-cols-1 lg:min-h-[calc(100vh-14rem)]",
          isExpandedWithPreview
            ? "lg:grid-cols-[320px_44px_minmax(0,1fr)] xl:grid-cols-[360px_44px_minmax(0,1fr)]"
            : "lg:grid-cols-[1fr_44px_400px] xl:grid-cols-[1fr_44px_450px]",
        )}
      >
        <section className={cn("order-2 min-w-0 bg-muted/60 lg:order-1")}>
          {formPaneHeader && (
            <div className="border-b border-foreground/10 px-4 py-3 md:px-6">{formPaneHeader}</div>
          )}
          <div
            className={cn(
              "px-4 py-5 md:px-6 md:py-6",
              isExpandedWithPreview
                ? "lg:sticky lg:top-0 lg:max-h-[calc(100vh-10rem)] lg:overflow-y-auto"
                : "",
            )}
          >
            {formContent}
            {footer && (
              <div className="mt-10 flex justify-end gap-4 border-t border-foreground/10 pt-8">
                {footer}
              </div>
            )}
          </div>
        </section>

        {previewContent && (
          <>
            <div className="order-1 hidden bg-background lg:order-2 lg:flex lg:border-x lg:border-foreground/10">
              <div className="sticky top-0 flex h-full min-h-[calc(100vh-10rem)] w-full items-stretch justify-center">
                {dividerControl ?? <div className="h-full w-full" />}
              </div>
            </div>
            <section className="order-1 min-w-0 lg:order-3">
              {previewPaneHeader && (
                <div className="border-b border-foreground/10 px-4 py-3 md:px-6">
                  {previewPaneHeader}
                </div>
              )}
              <div
                className={cn(
                  "px-4 py-5 md:px-6 md:py-6",
                  isExpandedWithPreview
                    ? "lg:sticky lg:top-0 lg:max-h-[calc(100vh-10rem)] lg:overflow-y-scroll lg:[scrollbar-gutter:stable]"
                    : "lg:sticky lg:top-0",
                )}
              >
                {previewContent}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
