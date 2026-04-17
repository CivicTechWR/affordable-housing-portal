import { ReactNode } from "react";

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
      {description && <p className="text-sm text-muted-foreground mb-4">{description}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
    </div>
  );
}

export interface ListingFormLayoutProps {
  header: ReactNode;
  formContent: ReactNode;
  previewContent?: ReactNode;
  footer?: ReactNode;
}

export function ListingFormLayout({
  header,
  formContent,
  previewContent,
  footer,
}: ListingFormLayoutProps) {
  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 md:p-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
        {header}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_450px] gap-8">
        <div className="bg-card border rounded-xl shadow-sm p-6 md:p-8 order-2 lg:order-1">
          {formContent}
          {footer && <div className="flex justify-end gap-4 pt-8 mt-10 border-t">{footer}</div>}
        </div>

        {previewContent && (
          <div className="order-1 lg:order-2">
            {" "}
            <div className="sticky top-6">{previewContent}</div>
          </div>
        )}
      </div>
    </div>
  );
}
