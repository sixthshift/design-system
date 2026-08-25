import type { HTMLAttributes, ReactNode } from "react";
import { useState } from "react";
import { Editor } from "../Editor";
import type { ValidationError } from "../ValidationStatus";
import { ValidationStatus } from "../ValidationStatus";
import type { StatusBarItem } from "./StatusBar";
import { StatusBar } from "./StatusBar";
import type { Action } from "./Toolbar";
import { Toolbar } from "./Toolbar";

export type WorkspaceProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
  // Core editor props
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  typeDefinitions?: string;
  compilerOptions?: Record<string, unknown>;

  // Toolbar
  toolbar?: {
    actions?: Action[];
    primaryAction?: Action;
    leftContent?: ReactNode;
    rightContent?: ReactNode;
  };

  // Validation
  onValidate?: (errors: ValidationError[]) => void;

  // Status bar
  statusBar?: {
    items?: StatusBarItem[];
    leftContent?: ReactNode;
    rightContent?: ReactNode;
  };
};

/**
 * Comprehensive code editor workspace with toolbar, validation, and status bar
 *
 * Features:
 * - Full Monaco editor with IntelliSense
 * - Optional toolbar with actions
 * - Built-in validation display
 * - Status bar with metadata
 *
 * @example
 * ```tsx
 * <Workspace
 *   value={code}
 *   onChange={setCode}
 *   toolbar={{
 *     actions: [{ id: "format", label: "Format", onClick: format }],
 *     primaryAction: { id: "save", label: "Save", onClick: save }
 *   }}
 * />
 * ```
 */
export const Workspace = ({
  value,
  onChange,
  readOnly = false,
  typeDefinitions,
  compilerOptions,
  toolbar,
  onValidate,
  statusBar,
  className,
  ...props
}: WorkspaceProps) => {
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const handleValidate = (errors: ValidationError[]) => {
    setValidationErrors(errors);
    onValidate?.(errors);
  };

  return (
    <div {...props} className={`flex flex-col overflow-hidden rounded-lg border border-border-normal bg-bg-normal ${className ?? ""}`}>
      {/* Toolbar */}
      {toolbar && (
        <Toolbar actions={toolbar.actions} primaryAction={toolbar.primaryAction} leftContent={toolbar.leftContent} rightContent={toolbar.rightContent} />
      )}

      {/* Editor and validation */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Editor
          value={value}
          onChange={onChange}
          onValidate={handleValidate}
          readOnly={readOnly}
          typeDefinitions={typeDefinitions}
          compilerOptions={compilerOptions}
          className="flex-1"
        />

        {/* Validation panel */}
        {validationErrors.length > 0 && (
          <div className="border-border-normal border-t bg-bg-normal p-4">
            <ValidationStatus errors={validationErrors} />
          </div>
        )}
      </div>

      {/* Status bar */}
      <StatusBar items={statusBar?.items} leftContent={statusBar?.leftContent} rightContent={statusBar?.rightContent} />
    </div>
  );
};
