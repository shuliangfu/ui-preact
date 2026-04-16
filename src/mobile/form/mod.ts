/**
 * @module @dreamer/ui-preact/mobile/form
 * @description
 * **JSR**：`import … from "@dreamer/ui-preact/mobile/form"`。移动端**表单**；Select、MultiSelect、DatePicker 等多经本目录薄文件转导出 **shared/form** 实现，并保留移动交互分支（appearance 等）。
 *
 * @see {@link ../../shared/form/mod.ts} 共享表单符号清单
 */
export type { MaybeSignal } from "../../shared/form/maybe-signal.ts";
export { readMaybeSignal } from "../../shared/form/maybe-signal.ts";
export { Input } from "./Input.tsx";
export type { InputProps } from "./Input.tsx";
export { Search } from "./Search.tsx";
export type { SearchProps } from "./Search.tsx";
export { Password } from "./Password.tsx";
export type { PasswordProps } from "./Password.tsx";
export { Textarea } from "./Textarea.tsx";
export type { TextareaProps } from "./Textarea.tsx";
export { InputNumber } from "./InputNumber.tsx";
export type { InputNumberProps } from "./InputNumber.tsx";
export { AutoComplete } from "./AutoComplete.tsx";
export type { AutoCompleteProps } from "./AutoComplete.tsx";
export { Checkbox } from "./Checkbox.tsx";
export type { CheckboxProps } from "./Checkbox.tsx";
export { CheckboxGroup } from "./CheckboxGroup.tsx";
export type {
  CheckboxGroupOption,
  CheckboxGroupProps,
} from "./CheckboxGroup.tsx";
export { Radio } from "./Radio.tsx";
export type { RadioProps } from "./Radio.tsx";
export { RadioGroup } from "./RadioGroup.tsx";
export type { RadioGroupOption, RadioGroupProps } from "./RadioGroup.tsx";
export { Switch } from "./Switch.tsx";
export type { SwitchProps } from "./Switch.tsx";
export { Slider } from "./Slider.tsx";
export type { SliderProps } from "./Slider.tsx";
export { Rate } from "./Rate.tsx";
export type { RateProps } from "./Rate.tsx";
/** 与 shared 共用的下拉式 TimePicker（本目录为薄 re-export） */
export { TimePicker } from "./TimePicker.tsx";
export type { TimePickerProps } from "./TimePicker.tsx";
export { Upload } from "./Upload.tsx";
export type {
  UploadCoreProps,
  UploadFile,
  UploadFileStatus,
  UploadMultipleValueMode,
  UploadProps,
} from "./Upload.tsx";
export {
  DEFAULT_UPLOAD_CHUNK_SIZE,
  defaultGetUploadResultUrl,
  fileMatchesAccept,
  formatUploadFileSize,
  runChunkedUpload,
  uploadActionWithPhase,
  uploadFilePhasedChunks,
  uploadFileSimple,
} from "../../shared/form/mod.ts";
export type {
  ChunkedUploadOptions,
  ChunkUploadContext,
} from "../../shared/form/mod.ts";
export { ColorPicker } from "./ColorPicker.tsx";
export type { ColorPickerHandle, ColorPickerProps } from "./ColorPicker.tsx";
export { Mentions } from "./Mentions.tsx";
export type { MentionOption, MentionsProps } from "./Mentions.tsx";
export { Form } from "./Form.tsx";
export type { FormLayout, FormProps } from "./Form.tsx";
export { FormItem } from "./FormItem.tsx";
export type {
  FormItemLabelAlign,
  FormItemLabelPosition,
  FormItemProps,
} from "./FormItem.tsx";
export { FormList } from "./FormList.tsx";
export type { FormListProps } from "./FormList.tsx";
export { RichTextEditor } from "./RichTextEditor.tsx";
export type {
  RichTextEditorProps,
  ToolbarConfig,
  ToolbarItem,
  ToolbarPreset,
} from "./RichTextEditor.tsx";
export { MarkdownEditor } from "./MarkdownEditor.tsx";
export type {
  MarkdownEditorPreviewMode,
  MarkdownEditorProps,
} from "./MarkdownEditor.tsx";
/** 与 shared/form/Transfer 共用（本目录薄 re-export） */
export { Transfer } from "./Transfer.tsx";
export type { TransferItem, TransferProps } from "./Transfer.tsx";

export { Select } from "./Select.tsx";
export type { SelectAppearance, SelectOption, SelectProps } from "./Select.tsx";
export { MultiSelect } from "./MultiSelect.tsx";
export type {
  MultiSelectAppearance,
  MultiSelectOption,
  MultiSelectProps,
} from "./MultiSelect.tsx";
export { Cascader } from "./Cascader.tsx";
export type {
  CascaderAppearance,
  CascaderOption,
  CascaderProps,
} from "./Cascader.tsx";
export { DatePicker } from "./DatePicker.tsx";
export type { DatePickerProps } from "./DatePicker.tsx";
export { DateTimePicker } from "./DateTimePicker.tsx";
export type { DateTimePickerProps } from "./DateTimePicker.tsx";
export { TreeSelect } from "./TreeSelect.tsx";
export type {
  TreeSelectAppearance,
  TreeSelectOption,
  TreeSelectProps,
} from "./TreeSelect.tsx";
