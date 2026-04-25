import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

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

function PaneHeader({ children }: { children: ReactNode }) {
  return <div className="border-b border-foreground/10 px-4 py-3 md:px-6">{children}</div>;
}

function PaneFooter({ children }: { children: ReactNode }) {
  return (
    <div className="mt-10 flex justify-end gap-4 border-t border-foreground/10 pt-8">
      {children}
    </div>
  );
}

function PaneBody({
  children,
  footer,
  isSticky = false,
}: {
  children: ReactNode;
  footer?: ReactNode;
  isSticky?: boolean;
}) {
  return (
    <div className={cn("px-4 py-5 md:px-6 md:py-6", isSticky && "lg:sticky lg:top-0")}>
      {children}
      {footer ? <PaneFooter>{footer}</PaneFooter> : null}
    </div>
  );
}

function StickyPaneScroll({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  return (
    <ScrollArea type="always" className="lg:sticky lg:top-0 lg:h-[calc(100vh-10rem)]">
      <PaneBody footer={footer}>{children}</PaneBody>
    </ScrollArea>
  );
}

function PreviewDivider({ dividerControl }: { dividerControl?: ReactNode }) {
  return (
    <div className="order-1 hidden bg-background lg:order-2 lg:flex lg:border-x lg:border-foreground/10">
      <div className="sticky top-0 flex h-full min-h-[calc(100vh-10rem)] w-full items-stretch justify-center">
        {dividerControl ?? <div className="h-full w-full" />}
      </div>
    </div>
  );
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
          {formPaneHeader && <PaneHeader>{formPaneHeader}</PaneHeader>}
          {isExpandedWithPreview ? (
            <StickyPaneScroll footer={footer}>{formContent}</StickyPaneScroll>
          ) : (
            <PaneBody footer={footer}>{formContent}</PaneBody>
          )}
        </section>

        {previewContent && (
          <>
            <PreviewDivider dividerControl={dividerControl} />
            <section className="order-1 min-w-0 lg:order-3">
              {previewPaneHeader && <PaneHeader>{previewPaneHeader}</PaneHeader>}
              {isExpandedWithPreview ? (
                <StickyPaneScroll>{previewContent}</StickyPaneScroll>
              ) : (
                <PaneBody isSticky>{previewContent}</PaneBody>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
