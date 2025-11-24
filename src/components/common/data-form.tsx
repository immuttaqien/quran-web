"use client"

import type { CheckedState } from "@radix-ui/react-checkbox"
// import CRC32 from "crc-32"
// import { RotateCcwIcon, SaveIcon } from "lucide-react"
// import { usePathname } from "next/navigation"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  // useMemo,
  useRef,
  useState,
  useTransition,
} from "react"
import type { DateRange } from "react-day-picker"
import type { NumberFormatValues } from "react-number-format"
import { toast } from "sonner"
import z from "zod/v4"

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
// import useDebounce from "@/hooks/use-debounce"
import type { FileWithPreview } from "@/hooks/use-file-upload"
// import useIndexedDB from "@/hooks/use-indexeddb"
import { APIError } from "@/lib/fetcher"
import { cn, slugify } from "@/lib/utils"

import CopyStatusIcon from "../icons/copy-status-icon"
import ErrorToast from "../toast/error-toast"
import { Button } from "../ui/button"
import { Checkbox } from "../ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "../ui/field"
import { Input } from "../ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupInputNumber,
  InputGroupTextarea,
} from "../ui/input-group"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { Select, SelectContent, SelectTrigger, SelectValue } from "../ui/select"
import { Spinner } from "../ui/spinner"
import { Switch } from "../ui/switch"
import { Textarea } from "../ui/textarea"
import {
  AudioUpload,
  AudioUploadDropArea,
  AudioUploadPreview,
  type SingleAudioAccept,
} from "./audio-upload"
import DataSelect from "./data-select"
import { DatePicker } from "./date-picker"
import { DateRangePicker } from "./date-range-picker"
import FieldColumn from "./field-column"
import {
  FileUpload,
  FileUploadDropArea,
  FileUploadPreview,
  type SingleFileAccept,
} from "./file-upload"
import {
  ImageUpload,
  ImageUploadDropArea,
  ImageUploadPreview,
  type SingleImageAccept,
} from "./image-upload"
import InputNumber from "./input-number"
import { PdfUpload, PdfUploadDropArea, PdfUploadPreview } from "./pdf-upload"
import Tiptap from "./tiptap"
// import { TextShimmer } from "./text-shimmer"
import VideoUpload, {
  type SingleVideoAccept,
  VideoUploadDropArea,
  VideoUploadPreview,
} from "./video-upload"

type TDataValue = string | number | boolean | object | null | unknown

type TDataType = Record<string, TDataValue>

type RegisterProps = {
  name: string
  ref: React.RefObject<HTMLElement | null>
  valueRef: React.RefObject<{
    setValue: (value: TDataValue) => void
  } | null>
  defaultValue?: TDataValue
  validation?: z.ZodType
  scrollYOffset?: number
}

const DataFormContext = createContext<{
  register: (props: RegisterProps) => void
  unregister: (name: string) => void
  setValidation: (name: string, schema: z.ZodType) => void
  getValue: (name: string, defaultValue?: TDataValue) => TDataValue
  setValue: (name: string, value: TDataValue) => void
  getErrors: (name: string) => string[]
  resetForm: () => void
  formData: TDataType
  isPending: boolean
  dirty: boolean
  saving: boolean
  saved: boolean
}>({
  register: () => {},
  unregister: () => {},
  setValidation: () => {},
  getValue: () => {},
  setValue: () => {},
  getErrors: () => [],
  resetForm: () => {},
  formData: {},
  isPending: false,
  dirty: false,
  saving: false,
  saved: false,
})

// type ActionProps<T extends TDataType> = {
//   payload: T
//   triggerError: (name: keyof T & string, message: string) => void
// }

type ActionFn<T extends TDataType> = (
  payload: T,
  helpers: { triggerError: (name: keyof T & string, message: string) => void }
) => void | Promise<void>

interface DataFormProps<T extends TDataType> extends React.PropsWithChildren {
  preValidation?: (payload: T) => void | Promise<void>
  action: ActionFn<T>
  postAction?: (payload: T) => void | Promise<void>
  resetOnSuccess?: boolean
  type?: "create" | "edit" | (string & {})
  className?: string
  asChild?: boolean
}

function DataForm<T extends TDataType>({
  preValidation,
  action,
  postAction,
  resetOnSuccess = false,
  // type = "",
  className,
  children,
}: DataFormProps<T>) {
  // const [registering, setRegistering] = useState(true)
  const [creating, setCreating] = useState(false)
  // const [dirty, setDirty] = useState(false)
  // const [saving, setSaving] = useState(false)
  // const [saved, setSaved] = useState(false)

  // const [formDraftExists, setFormDraftExists] = useState(false)

  // const pathname = usePathname()
  // const key = `${pathname}${type ? `:${type}` : ""}`

  // const { getByID, add, update } = useIndexedDB("form-drafts", {
  //   databaseName: "FormDB",
  //   version: 1,
  //   stores: [
  //     {
  //       name: "form-drafts",
  //       id: {},
  //       indices: [
  //         { name: "data", keyPath: "data" },
  //         { name: "updatedAt", keyPath: "updatedAt" },
  //       ],
  //     },
  //   ],
  // })

  const [isPending, startTransition] = useTransition()

  const [formData, setFormData] = useState<
    Record<
      string,
      Omit<RegisterProps, "name" | "scrollYOffset"> & {
        value: TDataValue
        scrollYOffset: number
      }
    >
  >({})
  const [initialFormData, setInitialFormData] = useState<
    Record<string, TDataValue>
  >({})
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({})

  // const [initialFormChecksum, setInitialFormChecksum] = useState(
  //   () => CRC32.str(JSON.stringify({})) >>> 0
  // )

  // const currentFormChecksum = useMemo(() => {
  //   return (
  //     CRC32.str(
  //       JSON.stringify(
  //         Object.fromEntries(
  //           Object.entries(formData).map(([key, val]) => [key, val.value])
  //         )
  //       )
  //     ) >>> 0
  //   )
  // }, [formData])

  // const formDataIndexdb = {
  //   data: Object.fromEntries(
  //     Object.entries(formData).map(([key, val]) => [key, val.value])
  //   ),
  //   updatedAt: Date.now(),
  // }

  // useEffect(() => {
  //   setDirty(currentFormChecksum !== initialFormChecksum)
  // }, [currentFormChecksum, initialFormChecksum])

  // useEffect(() => {
  //   setSaving(dirty)
  // }, [currentFormChecksum, dirty])

  // useEffect(() => {
  //   if (saving) {
  //     window.onbeforeunload = () => true
  //   } else {
  //     window.onbeforeunload = null
  //   }

  //   return () => {
  //     window.onbeforeunload = null
  //   }
  // }, [saving])

  // useDebounce(
  //   () => {
  //     if (formDraftExists) {
  //       update(formDataIndexdb, key)
  //       if (saving) setSaving(false)
  //       if (dirty && !saved) {
  //         setSaved(true)
  //         setTimeout(() => setSaved(false), 2000)
  //       }
  //       return
  //     }

  //     getByID(key).then((formDraft: { data: TDataType; updatedAt: number }) => {
  //       if (!formDraft) {
  //         add(formDataIndexdb, key).then(() => {
  //           setFormDraftExists(true)
  //           if (saving) setSaving(false)
  //           if (dirty && !saved) {
  //             setSaved(true)
  //             setTimeout(() => setSaved(false), 2000)
  //           }
  //         })
  //       } else {
  //         update(formDataIndexdb, key)
  //         setFormDraftExists(true)
  //         if (saving) setSaving(false)
  //         if (dirty && !saved) {
  //           setSaved(true)
  //           setTimeout(() => setSaved(false), 2000)
  //         }
  //       }
  //     })
  //   },
  //   [currentFormChecksum],
  //   2000
  // )

  function resetForm() {
    Object.keys(initialFormData).forEach((key) => {
      const initialValue = initialFormData[key]
      formData[key]?.valueRef?.current?.setValue(initialValue)
    })

    setFormData((prev) => {
      const newData = { ...prev }
      Object.keys(initialFormData).forEach((key) => {
        const initialValue = initialFormData[key]
        newData[key] = { ...prev[key], value: initialValue }
      })
      return newData
    })
  }

  function register({
    name,
    defaultValue = null,
    scrollYOffset = 0,
    ...props
  }: RegisterProps) {
    // getByID(key).then((formDraft: { data: TDataType; updatedAt: number }) => {
    // const draftValue = formDraft?.data[name]

    // if (draftValue) {
    //   if (Array.isArray(draftValue)) {
    //     props.valueRef?.current?.setValue(
    //       draftValue.map((v) => {
    //         if (v instanceof File) {
    //           const fileWithPreview: FileWithPreview = {
    //             preview: URL.createObjectURL(v),
    //             file: v,
    //             id: `${v.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    //           }
    //           return fileWithPreview
    //         }
    //         return v
    //       })
    //     )
    //   } else {
    //     props.valueRef?.current?.setValue(draftValue as string)
    //   }
    // }

    // if (registering) setRegistering(false)

    setFormData((prev) => {
      if (prev[name] !== undefined) return prev

      return {
        ...prev,
        [name]: {
          // value: draftValue || defaultValue,
          value: defaultValue,
          scrollYOffset,
          ...props,
        },
      }
    })

    setInitialFormData((prev) => {
      if (prev[name] !== undefined) return prev
      const newForm = {
        ...prev,
        [name]: defaultValue,
      }

      // setInitialFormChecksum(CRC32.str(JSON.stringify(newForm)) >>> 0)

      return newForm
    })
    // })
  }

  function unregister(name: string) {
    setFormData((prev) => {
      const newData = { ...prev }
      delete newData[name]
      return newData
    })
    setFormErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[name]
      return newErrors
    })
  }

  function setValidation(name: string, schema: z.ZodType) {
    setFormData((prev) => {
      if (prev[name] !== undefined) {
        return {
          ...prev,
          [name]: { ...prev[name], validation: schema },
        }
      }
      return prev
    })
  }

  function getValue(name: string, defaultValue: TDataValue = ""): TDataValue {
    return (formData[name]?.value as TDataValue) ?? defaultValue
  }

  function setValue(name: string, value: TDataValue) {
    setFormData((prev) => ({ ...prev, [name]: { ...prev[name], value } }))
  }

  function getErrors(name: string): string[] {
    return formErrors[name] ?? []
  }

  const applyErrors = useCallback(
    (errors: Record<string, string[]>) => {
      setFormErrors(errors)

      const firstErrorField = Object.keys(errors)[0]
      if (!firstErrorField) {
        toast.custom((id) => (
          <ErrorToast id={id} message="Ada kesalahan dalam formulir" />
        ))
        return
      }

      const ref = formData[firstErrorField]?.ref?.current
      const scrollYOffset = formData[firstErrorField]?.scrollYOffset ?? 0
      if (ref) {
        ref.focus()
        const y =
          ref.getBoundingClientRect().top + window.pageYOffset + scrollYOffset
        window.scrollTo({ top: y, behavior: "smooth" })
      }

      toast.custom((id) => (
        <ErrorToast id={id} message={errors[firstErrorField][0]} />
      ))
    },
    [formData]
  )

  const triggerError = useCallback(
    (name: keyof T & string, message: string) => {
      // setFormErrors((prev) => {
      //   const merged = { ...prev, [name]: [message] }
      //   applyErrors(merged)
      //   return merged
      // })
      applyErrors({ [name]: [message] })
    },
    [applyErrors]
  )

  function handleValidate():
    | { success: true; payload: T }
    | { success: false } {
    const newErrors: Record<string, string[]> = {}

    for (const [name, { value, validation }] of Object.entries(formData)) {
      if (validation) {
        const result = validation.safeParse(value)
        if (!result.success) {
          const tree = z.treeifyError(result.error)

          if (tree.errors.length > 0) {
            newErrors[name] = z.treeifyError(result.error).errors
          } else {
            newErrors[name] = ["Input tidak valid"]
          }
        }
      }
    }

    setFormErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      applyErrors(newErrors)
      return { success: false }
    }

    const payload = Object.fromEntries(
      Object.entries(formData).map(([key, { value }]) => [key, value])
    )

    return { success: true, payload: payload as T }
  }

  return (
    <DataFormContext.Provider
      value={{
        register,
        unregister,
        setValidation,
        getValue,
        setValue,
        getErrors,
        resetForm,
        formData,
        isPending: creating || isPending,
        dirty: false,
        saving: false,
        saved: false,
      }}>
      <form
        // React 19 bug: using `form action` resets controlled checkboxes.
        // Using `action` directly causes controlled checkboxes to reset.
        // Switch to `onSubmit` + preventDefault until the issue is resolved.
        // See: https://github.com/facebook/react/issues/31695
        // action={() => {
        //   const result = handleValidate()
        //   if (!result.success) return

        //   startTransition(async () => {
        //     await action(result.payload, { triggerError })
        //   })
        // }}
        className={className}
        onSubmit={async (e) => {
          e.preventDefault()

          startTransition(async () => {
            try {
              setCreating(true)
              let success = true

              await preValidation?.(
                Object.fromEntries(
                  Object.entries(formData).map(([key, { value }]) => [
                    key,
                    value,
                  ])
                ) as T
              )

              const result = handleValidate()
              if (!result.success) {
                setCreating(false)
                return
              }

              await action(result.payload, {
                triggerError: (name, message) => {
                  triggerError(name, message)
                  success = false
                },
              })
              if (!success) {
                setCreating(false)
                return
              }

              await postAction?.(result.payload)
              // await update(
              //   {
              //     data: Object.fromEntries(
              //       Object.entries(initialFormData).map(([key, val]) => [
              //         key,
              //         val,
              //       ])
              //     ),
              //     updatedAt: Date.now(),
              //   },
              //   key
              // )

              if (resetOnSuccess) {
                setCreating(false)
              }
            } catch (error) {
              console.debug(error)
              setCreating(false)

              if (error instanceof APIError) {
                toast.custom((id) => (
                  <ErrorToast id={id} message={error.message} />
                ))
              } else if (error instanceof Error) {
                toast.custom((id) => (
                  <ErrorToast id={id} message={error.message} />
                ))
              } else {
                toast.custom((id) => (
                  <ErrorToast
                    id={id}
                    message="Terjadi kesalahan saat memproses formulir"
                  />
                ))
              }
            }
          })
        }}>
        <FieldGroup>
          {/* className={cn(
            "opacity-0 transition-opacity",
            !registering && "opacity-100"
          )} */}
          {children}
        </FieldGroup>
      </form>
    </DataFormContext.Provider>
  )
}

interface DataFormGroupProps extends React.PropsWithChildren {
  title?: string
  description?: string
  showStatus?: boolean
}

export function DataFormGroup({
  title,
  description,
  // showStatus = false,
  children,
}: DataFormGroupProps) {
  // const { dirty, saving, saved, resetForm } = useContext(DataFormContext)

  return (
    <FieldSet>
      <Field orientation="horizontal">
        <FieldSet>
          {title ? <FieldLegend>{title}</FieldLegend> : null}
          {description ? (
            <FieldDescription>{description}</FieldDescription>
          ) : null}
        </FieldSet>
        {/* {showStatus ? (
          <div className="flex flex-1 justify-end gap-4">
            <div className="relative flex items-center text-sm">
              <div
                className={cn(
                  "absolute right-0 transition-all",
                  saving ? "scale-100 opacity-100" : "scale-0 opacity-0"
                )}>
                <TextShimmer className="font-mono text-sm" duration={1}>
                  Menyimpan...
                </TextShimmer>
              </div>
              <div
                className={cn(
                  "flex items-center gap-1 transition-all",
                  !saving && saved
                    ? "scale-100 opacity-100"
                    : "scale-0 opacity-0"
                )}>
                <SaveIcon className="text-primary size-4" />
                <div className="text-primary">Tersimpan!</div>
              </div>
            </div>
            {dirty ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void resetForm()}>
                <RotateCcwIcon />
                Reset
              </Button>
            ) : null}
          </div>
        ) : null} */}
      </Field>

      <FieldGroup>{children}</FieldGroup>
    </FieldSet>
  )
}

export function DataFormStatus() {
  // const { dirty, saving, saved, resetForm } = useContext(DataFormContext)
  return null
  // return (
  //   <div className="flex flex-1 justify-end gap-4">
  //     <div className="relative flex items-center text-sm">
  //       <div
  //         className={cn(
  //           "absolute right-0 transition-all",
  //           saving ? "scale-100 opacity-100" : "scale-0 opacity-0"
  //         )}>
  //         <TextShimmer className="font-mono text-sm" duration={1}>
  //           Menyimpan...
  //         </TextShimmer>
  //       </div>
  //       <div
  //         className={cn(
  //           "flex items-center gap-1 transition-all",
  //           !saving && saved ? "scale-100 opacity-100" : "scale-0 opacity-0"
  //         )}>
  //         <SaveIcon className="text-primary size-4" />
  //         <div className="text-primary">Tersimpan!</div>
  //       </div>
  //     </div>
  //     {dirty ? (
  //       <Button
  //         type="button"
  //         variant="outline"
  //         size="sm"
  //         onClick={() => void resetForm()}>
  //         <RotateCcwIcon />
  //         Reset
  //       </Button>
  //     ) : null}
  //   </div>
  // )
}

export const DataFormFieldColumn = FieldColumn

const DataFormFieldContext = createContext<{ name: string; required: boolean }>(
  { name: "", required: false }
)

interface DataFormFieldProps<T extends TDataType>
  extends React.PropsWithChildren {
  name: keyof T & string
  label?: React.ReactNode
  description?: string
  bug?: string
  required?: boolean
  className?: string
}

function DataFormField<T extends TDataType>({
  name,
  label,
  description,
  bug,
  required = false,
  className,
  children,
}: DataFormFieldProps<T>) {
  const id = useId()
  const { getErrors } = useContext(DataFormContext)

  const errors = getErrors(name)

  return (
    <DataFormFieldContext.Provider value={{ name, required }}>
      <Field className={className} data-invalid={errors.length > 0}>
        {label ? (
          <FieldLabel className={cn(!required && "block")} htmlFor={name}>
            {label}{" "}
            {!required ? (
              <span className="font-normal text-muted-foreground">
                (Opsional)
              </span>
            ) : null}
          </FieldLabel>
        ) : null}
        {children}
        {description ? (
          <FieldDescription>{description}</FieldDescription>
        ) : null}
        {bug ? (
          <FieldDescription className="font-bold text-amber-600 dark:text-amber-500">
            {bug}
          </FieldDescription>
        ) : null}
        {errors.length > 0 ? (
          <FieldError>
            {errors.length > 1 ? (
              <ul className="list-disc space-y-1 pl-5">
                {errors.map((err, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: only for error list
                  <li key={`${id}-err-${i}`}>{err}</li>
                ))}
              </ul>
            ) : (
              errors[0]
            )}
          </FieldError>
        ) : null}
      </Field>
    </DataFormFieldContext.Provider>
  )
}

interface DataFormInputProps {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  placeholder?: string
  type?: "text" | "time" | "color" | "password"
  inputMode?: React.HTMLAttributes<HTMLElement>["inputMode"]
  validation?: z.ZodString | z.ZodEmail | z.ZodURL
  scrollYOffset?: number
  className?: string
  disabled?: boolean
  group?: boolean
}

export function DataFormInput({
  value: propValue,
  defaultValue = "",
  onChange,
  placeholder,
  type = "text",
  inputMode,
  validation,
  scrollYOffset = 0,
  className,
  disabled,
  group = false,
}: DataFormInputProps) {
  const isControlled = propValue !== undefined
  const [internalValue, setInternalValue] = useState(defaultValue)
  const value = isControlled ? propValue : internalValue

  const { name, required } = useContext(DataFormFieldContext)
  const { register, unregister, setValue, getErrors } =
    useContext(DataFormContext)

  const inputRef = useRef<HTMLInputElement>(null)
  const valueRef = useRef<{ setValue: (value: TDataValue) => void }>(null)
  const errors = getErrors(name)

  // biome-ignore lint/correctness/useExhaustiveDependencies: we only want to run this on mount/unmount
  useEffect(() => {
    const schema = required
      ? (validation ?? z.string()).nonempty({ message: "Wajib diisi" })
      : validation

    register({
      name,
      defaultValue: value,
      ref: inputRef,
      valueRef,
      validation: schema,
      scrollYOffset,
    })

    return () => {
      unregister(name)
    }
  }, [name])

  useImperativeHandle(valueRef, () => ({
    setValue: (value) => {
      if (!isControlled) setInternalValue(value as string)
      onChange?.(value as string)
    },
  }))

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!isControlled) setInternalValue(e.target.value)
    onChange?.(e.target.value)
    setValue(name, e.target.value)
  }

  const Comp = group ? InputGroupInput : Input

  return (
    <Comp
      aria-invalid={errors.length > 0 || undefined}
      className={className}
      disabled={disabled}
      id={name}
      inputMode={inputMode}
      name={name}
      onChange={handleChange}
      placeholder={placeholder}
      ref={inputRef}
      type={type}
      value={value}
    />
  )
}

interface DataFormInputNumberProps {
  value?: number | null
  defaultValue?: number
  onChange?: (value?: number | null) => void
  placeholder?: string
  decimalScale?: number
  fixedDecimalScale?: boolean
  thousandSeparator?: string | boolean
  decimalSeparator?: string
  allowNegative?: boolean
  isAllowed?: (values: NumberFormatValues) => boolean
  validation?: z.ZodNumber
  scrollYOffset?: number
  className?: string
  disabled?: boolean
  group?: boolean
}

export function DataFormInputNumber({
  value: propValue,
  defaultValue,
  onChange,
  placeholder,
  decimalScale,
  fixedDecimalScale,
  thousandSeparator,
  decimalSeparator,
  allowNegative,
  isAllowed,
  validation,
  scrollYOffset = 0,
  className,
  disabled,
  group = false,
}: DataFormInputNumberProps) {
  const isControlled = propValue !== undefined
  const [internalValue, setInternalValue] = useState<number | null | undefined>(
    defaultValue
  )
  const value = isControlled ? propValue : internalValue

  const { name, required } = useContext(DataFormFieldContext)
  const { register, unregister, setValue, getErrors } =
    useContext(DataFormContext)

  const inputRef = useRef<HTMLInputElement>(null)
  const valueRef = useRef<{ setValue: (value: TDataValue) => void }>(null)
  const errors = getErrors(name)

  // biome-ignore lint/correctness/useExhaustiveDependencies: we only want to run this on mount/unmount
  useEffect(() => {
    const schema = required
      ? (validation ?? z.number({ message: "Wajib diisi" }))
      : validation

    register({
      name,
      defaultValue: value,
      ref: inputRef,
      valueRef,
      validation: schema,
      scrollYOffset,
    })

    return () => {
      unregister(name)
    }
  }, [name])

  useImperativeHandle(valueRef, () => ({
    setValue: (value) => {
      const v = (value as number | undefined) ?? null
      if (!isControlled) setInternalValue(v)
      onChange?.(v)
    },
  }))

  function handleChange({ floatValue }: NumberFormatValues) {
    if (!isControlled) setInternalValue(floatValue ?? null)
    onChange?.(floatValue ?? null)
    setValue(name, floatValue ?? null)
  }

  const Comp = group ? InputGroupInputNumber : InputNumber

  return (
    <Comp
      allowNegative={allowNegative}
      aria-invalid={errors.length > 0 || undefined}
      className={className}
      decimalScale={decimalScale}
      decimalSeparator={decimalSeparator}
      disabled={disabled}
      fixedDecimalScale={fixedDecimalScale}
      getInputRef={inputRef}
      id={name}
      isAllowed={isAllowed}
      name={name}
      onValueChange={handleChange}
      placeholder={placeholder}
      thousandSeparator={thousandSeparator}
      value={value}
    />
  )
}
interface DataFormTextareaProps {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  placeholder?: string
  validation?: z.ZodString
  scrollYOffset?: number
  className?: string
  disabled?: boolean
  group?: boolean
}

export function DataFormTextarea({
  value: propValue,
  defaultValue = "",
  onChange,
  placeholder,
  validation,
  scrollYOffset = 0,
  className,
  disabled,
  group = false,
}: DataFormTextareaProps) {
  const isControlled = propValue !== undefined
  const [internalValue, setInternalValue] = useState(defaultValue)
  const value = isControlled ? propValue : internalValue

  const { name, required } = useContext(DataFormFieldContext)
  const { register, unregister, setValue, getErrors } =
    useContext(DataFormContext)

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const valueRef = useRef<{ setValue: (value: TDataValue) => void }>(null)
  const errors = getErrors(name)

  // biome-ignore lint/correctness/useExhaustiveDependencies: we only want to run this on mount/unmount
  useEffect(() => {
    const schema = required
      ? (validation ?? z.string()).nonempty({ message: "Wajib diisi" })
      : validation

    register({
      name,
      defaultValue: value,
      ref: inputRef,
      valueRef,
      validation: schema,
      scrollYOffset,
    })

    return () => {
      unregister(name)
    }
  }, [name])

  useImperativeHandle(valueRef, () => ({
    setValue: (value) => {
      setInternalValue(value as string)
      onChange?.(value as string)
    },
  }))

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    if (!isControlled) setInternalValue(e.target.value)
    onChange?.(e.target.value)
    setValue(name, e.target.value)
  }

  const Comp = group ? InputGroupTextarea : Textarea

  return (
    <Comp
      aria-invalid={errors.length > 0 || undefined}
      className={className}
      disabled={disabled}
      id={name}
      name={name}
      onChange={handleChange}
      placeholder={placeholder}
      ref={inputRef}
      value={value}
    />
  )
}

interface DataFormSlugProps {
  value?: string
  onChange?: (value: string) => void
  className?: string
}

export function DataFormSlug({
  value = "",
  onChange,
  className,
}: DataFormSlugProps) {
  const { name } = useContext(DataFormFieldContext)
  const { register, unregister, setValue, getErrors } =
    useContext(DataFormContext)

  const inputRef = useRef<HTMLInputElement>(null)
  const valueRef = useRef<{ setValue: (value: TDataValue) => void }>(null)
  const errors = getErrors(name)

  const [copyToClipboard, isCopied] = useCopyToClipboard()

  // biome-ignore lint/correctness/useExhaustiveDependencies: we only want to run this on mount/unmount
  useEffect(() => {
    register({ name, ref: inputRef, valueRef })

    return () => {
      unregister(name)
    }
  }, [name])

  // biome-ignore lint/correctness/useExhaustiveDependencies: we only want to run this on mount/unmount
  useEffect(() => {
    setValue(name, slugify(value))
  }, [value])

  useImperativeHandle(valueRef, () => ({
    setValue: (value) => {
      onChange?.(value as string)
    },
  }))

  return (
    <InputGroup className={cn("bg-muted/50", className)}>
      <InputGroupInput
        aria-invalid={errors.length > 0 || undefined}
        id={name}
        name={name}
        readOnly
        value={slugify(value)}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          aria-label="Copy"
          onClick={() => void copyToClipboard(slugify(value))}
          size="icon-xs"
          title="Copy">
          <CopyStatusIcon isCopied={isCopied} />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}

interface DataFormSelectCommonProps {
  placeholder?: string
  scrollYOffset?: number
  className?: string
  disabled?: boolean
  group?: boolean
}

interface DataFormSelectWithChildren<T extends string>
  extends DataFormSelectCommonProps {
  children: React.ReactNode

  value?: T
  defaultValue?: T
  onChange?: (value: T) => void
}

interface DataFormSelectWithLoadItems<T> extends DataFormSelectCommonProps {
  value?: T | null
  defaultValue?: T
  onChange?: (value: T | null) => void
  disabledItems?: (value: T) => boolean

  loadItems: (props: {
    start?: number
    limit?: number
    keyword?: string
  }) => Promise<{ data: T[] }>
  options?: Record<string, unknown>
  limit?: number
  renderItem: (value: T) => React.ReactNode
  renderSelected?: (value: T) => React.ReactNode
  getOptionValue: (item: T) => string
  noDataLabel?: string
  emptySearchLabel?: (search: string) => string
  errorLabel?: string
  allowClear?: boolean
  enableSearch?: boolean
}

export type DataFormSelectProps<T, V extends string = string> =
  | DataFormSelectWithChildren<V>
  | DataFormSelectWithLoadItems<T>

export function DataFormSelect<T extends string>(
  props: DataFormSelectWithChildren<T>
): React.ReactElement
export function DataFormSelect<T>(
  props: DataFormSelectWithLoadItems<T>
): React.ReactElement

export function DataFormSelect<T>(props: DataFormSelectProps<T>) {
  const isControlled = props.value !== undefined
  const [internalValue, setInternalValue] = useState<T | null | undefined>(
    props.defaultValue as T | null | undefined
  )
  const value = isControlled ? props.value : internalValue

  const { name, required } = useContext(DataFormFieldContext)
  const { register, unregister, setValue, getErrors } =
    useContext(DataFormContext)

  const inputRef = useRef<HTMLButtonElement>(null)
  const valueRef = useRef<{ setValue: (value: TDataValue) => void }>(null)
  const errors = getErrors(name)

  // biome-ignore lint/correctness/useExhaustiveDependencies: we only want to run this on mount/unmount
  useEffect(() => {
    let schema: z.ZodType | undefined
    if ("children" in props) {
      schema = required
        ? z.string().nonempty({ message: "Wajib diisi" })
        : undefined
    } else {
      schema = required ? z.object({}, { error: "Wajib diisi" }) : undefined
    }

    register({
      name,
      defaultValue: "children" in props ? value || "" : value,
      ref: inputRef,
      valueRef,
      validation: schema,
      scrollYOffset: props.scrollYOffset,
    })

    return () => {
      unregister(name)
    }
  }, [name])

  useImperativeHandle(valueRef, () => ({
    setValue: (value) => {
      if (!isControlled) setInternalValue(value as T | null)
      if ("children" in props) {
        props.onChange?.(value as string)
      } else {
        props.onChange?.(value as T | null)
      }
    },
  }))

  function handleChange(value: unknown) {
    if (!isControlled) setInternalValue(value as T | null)
    if ("children" in props) {
      props.onChange?.(value as string)
    } else {
      props.onChange?.(value as T | null)
    }
    setValue(name, value)
  }

  if ("children" in props) {
    return (
      <Select onValueChange={handleChange} value={(value as string) || ""}>
        <SelectTrigger
          aria-invalid={errors.length > 0 || undefined}
          className={props.className}
          disabled={props.disabled}
          id={name}>
          <SelectValue placeholder={props.placeholder} ref={inputRef} />
        </SelectTrigger>
        <SelectContent>{props.children}</SelectContent>
      </Select>
    )
  }

  return (
    <DataSelect
      allowClear={props.allowClear}
      aria-invalid={errors.length > 0 || undefined}
      className={props.className}
      disabled={props.disabled}
      disabledItems={props.disabledItems}
      emptySearchLabel={props.emptySearchLabel}
      enableSearch={props.enableSearch}
      errorLabel={props.errorLabel}
      getOptionValue={props.getOptionValue}
      group={props.group}
      id={name}
      limit={props.limit}
      loadItems={props.loadItems}
      noDataLabel={props.noDataLabel}
      onChange={handleChange}
      options={props.options}
      placeholder={props.placeholder}
      ref={inputRef}
      renderItem={props.renderItem}
      renderSelected={props.renderSelected}
      value={value as T | null}
    />
  )
}

const DataFormRadioGroupContext = createContext<{
  errors: string[]
  registerOption: (option: string) => void
  unregisterOption: (option: string) => void
  variant: "default" | "card"
}>({
  errors: [],
  registerOption: () => {},
  unregisterOption: () => {},
  variant: "default",
})

interface DataFormRadioGroupProps<T extends string>
  extends React.PropsWithChildren {
  value?: T
  defaultValue?: string
  onChange?: (value: T) => void
  scrollYOffset?: number
  className?: string
  disabled?: boolean
  variant?: "default" | "card"
}

export function DataFormRadioGroup<T extends string>({
  value: propValue,
  defaultValue = "",
  onChange,
  scrollYOffset,
  className,
  disabled,
  variant = "default",
  children,
}: DataFormRadioGroupProps<T>) {
  const isControlled = propValue !== undefined
  const [internalValue, setInternalValue] = useState(defaultValue)
  const value = isControlled ? propValue : internalValue

  const { name, required } = useContext(DataFormFieldContext)
  const { register, unregister, setValidation, setValue, getErrors } =
    useContext(DataFormContext)

  const inputRef = useRef<HTMLDivElement>(null)
  const valueRef = useRef<{ setValue: (value: TDataValue) => void }>(null)
  const errors = getErrors(name)

  const [options, setOptions] = useState<string[]>([])

  // biome-ignore lint/correctness/useExhaustiveDependencies: we only want to run this on mount/unmount
  useEffect(() => {
    const schema = required
      ? z.string().nonempty({ message: "Wajib diisi" })
      : undefined

    register({
      name,
      defaultValue: value,
      ref: inputRef,
      valueRef,
      validation: schema,
      scrollYOffset,
    })

    return () => {
      unregister(name)
    }
  }, [name])

  // biome-ignore lint/correctness/useExhaustiveDependencies: we only want to run this on mount/unmount
  useEffect(() => {
    let schema: z.ZodString | undefined

    if (options.length > 0) {
      schema = z
        .string()
        .refine((val) => options.includes(val) || (!required && val === ""), {
          error: (issue) => {
            if (typeof issue.input !== "string") return "Input tidak valid"
            if (issue.input === "") return "Wajib diisi"
            if (!options.includes(issue.input)) return "Input tidak valid"
            return "Input tidak valid"
          },
        })
    } else {
      schema = required
        ? z.string().nonempty({ message: "Wajib diisi" })
        : undefined
    }

    if (schema) {
      setValidation(name, schema)
    }
  }, [options])

  useImperativeHandle(valueRef, () => ({
    setValue: (value) => {
      if (!isControlled) setInternalValue(value as T)
      onChange?.(value as T)
    },
  }))

  function registerOption(option: string) {
    setOptions((prev) => {
      if (prev.includes(option)) return prev
      return [...prev, option]
    })
  }

  function unregisterOption(option: string) {
    setOptions((prev) => prev.filter((opt) => opt !== option))
  }

  function handleChange(value: T) {
    if (!isControlled) setInternalValue(value)
    onChange?.(value)
    setValue(name, value)
  }

  return (
    <DataFormRadioGroupContext.Provider
      value={{ errors, registerOption, unregisterOption, variant }}>
      <RadioGroup
        aria-invalid={errors.length > 0 || undefined}
        className={className}
        disabled={disabled}
        id={name}
        onValueChange={handleChange}
        ref={inputRef}
        value={value}>
        {children}
      </RadioGroup>
    </DataFormRadioGroupContext.Provider>
  )
}

interface DataFormRadioGroupItemProps extends React.PropsWithChildren {
  value: string
  sublabel?: string
  description?: React.ReactNode
  className?: string
  disabled?: boolean
}

export function DataFormRadioGroupItem({
  value,
  sublabel,
  description,
  disabled,
  className,
  children,
}: DataFormRadioGroupItemProps) {
  const id = useId()

  const { errors, registerOption, unregisterOption, variant } = useContext(
    DataFormRadioGroupContext
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: we only want to run this on mount/unmount
  useEffect(() => {
    registerOption(value)

    return () => {
      unregisterOption(value)
    }
  }, [value])

  if (variant === "card") {
    return (
      <FieldLabel className={className} htmlFor={id}>
        <Field data-invalid={errors.length > 0} orientation="horizontal">
          <FieldContent>
            <FieldTitle className={cn(sublabel && "block")}>
              {children}{" "}
              {sublabel ? (
                <span className="font-normal text-muted-foreground text-xs leading-[inherit]">
                  {sublabel}
                </span>
              ) : null}
            </FieldTitle>
            {description ? (
              <FieldDescription>{description}</FieldDescription>
            ) : null}
          </FieldContent>
          <RadioGroupItem
            aria-invalid={errors.length > 0 || undefined}
            disabled={disabled}
            id={id}
            value={value}
          />
        </Field>
      </FieldLabel>
    )
  }

  return (
    <Field data-invalid={errors.length > 0} orientation="horizontal">
      <RadioGroupItem
        aria-invalid={errors.length > 0 || undefined}
        disabled={disabled}
        id={id}
        value={value}
      />
      <FieldContent>
        <FieldLabel
          className={cn("font-normal", sublabel && "block", className)}
          htmlFor={id}>
          {children}{" "}
          {sublabel ? (
            <span className="font-normal text-muted-foreground text-xs leading-[inherit]">
              {sublabel}
            </span>
          ) : null}
        </FieldLabel>
        {description ? (
          <FieldDescription>{description}</FieldDescription>
        ) : null}
      </FieldContent>
    </Field>
  )
}

const DataFormSwitchContext = createContext<{
  required: boolean
  variant: "default" | "card"
}>({ required: false, variant: "default" })

interface DataFormSwitchProps extends React.PropsWithChildren {
  value?: boolean
  defaultValue?: boolean
  onChange?: (value: boolean) => void
  scrollYOffset?: number
  className?: string
  disabled?: boolean
  variant?: "default" | "card"
}

export function DataFormSwitch({
  value: propValue,
  defaultValue,
  onChange,
  scrollYOffset,
  className,
  disabled,
  variant = "default",
  children,
}: DataFormSwitchProps) {
  const isControlled = propValue !== undefined
  const [internalValue, setInternalValue] = useState(defaultValue)
  const value = isControlled ? propValue : internalValue

  const { name, required } = useContext(DataFormFieldContext)
  const { register, unregister, setValue, getErrors } =
    useContext(DataFormContext)

  const inputRef = useRef<HTMLButtonElement>(null)
  const valueRef = useRef<{ setValue: (value: TDataValue) => void }>(null)
  const errors = getErrors(name)

  // biome-ignore lint/correctness/useExhaustiveDependencies: we only want to run this on mount/unmount
  useEffect(() => {
    const schema = required
      ? z.literal(true, { error: "Wajib diaktifkan" })
      : undefined

    register({
      name,
      defaultValue: value ?? false,
      ref: inputRef,
      valueRef,
      validation: schema,
      scrollYOffset,
    })

    return () => {
      unregister(name)
    }
  }, [name])

  useImperativeHandle(valueRef, () => ({
    setValue: (value) => {
      if (!isControlled) setInternalValue(value as boolean)
      onChange?.(value as boolean)
    },
  }))

  function handleChange(checked: boolean) {
    if (!isControlled) setInternalValue(checked)
    onChange?.(checked)
    setValue(name, checked)
  }

  if (variant === "card") {
    return (
      <DataFormSwitchContext.Provider value={{ required, variant }}>
        <FieldLabel className={className} htmlFor={name}>
          <Field data-invalid={errors.length > 0} orientation="horizontal">
            {children}
            <Switch
              aria-invalid={errors.length > 0 || undefined}
              checked={value || false}
              className={className}
              disabled={disabled}
              id={name}
              onCheckedChange={handleChange}
              ref={inputRef}
            />
          </Field>
        </FieldLabel>
      </DataFormSwitchContext.Provider>
    )
  }

  return (
    <DataFormSwitchContext.Provider value={{ required, variant }}>
      <Field
        className={className}
        data-invalid={errors.length > 0}
        orientation="horizontal">
        {children}
        <Switch
          aria-invalid={errors.length > 0 || undefined}
          checked={value || false}
          className={className}
          disabled={disabled}
          id={name}
          onCheckedChange={handleChange}
          ref={inputRef}
        />
      </Field>
    </DataFormSwitchContext.Provider>
  )
}

interface DataFormSwitchLabelProps extends React.PropsWithChildren {
  label?: React.ReactNode
  description?: React.ReactNode
  className?: string
}

export function DataFormSwitchLabel({
  label,
  description,
  className,
  children,
}: DataFormSwitchLabelProps) {
  const { name } = useContext(DataFormFieldContext)

  const { variant } = useContext(DataFormSwitchContext)

  if (variant === "card") {
    return (
      <FieldContent className={className}>
        {label ? <FieldTitle>{label}</FieldTitle> : null}
        {description ? (
          <FieldDescription>{description}</FieldDescription>
        ) : null}
        {children}
      </FieldContent>
    )
  }

  return (
    <FieldContent className={className}>
      {label ? <FieldLabel htmlFor={name}>{label}</FieldLabel> : null}
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      {children}
    </FieldContent>
  )
}

const DataFormCheckboxContext = createContext<{
  errors: string[]
  registerOption: (option: string, checked: boolean) => void
  unregisterOption: (option: string) => void
  values: string[]
  handleChange: (option: string, checked: boolean) => void
  inputRef: React.RefObject<HTMLButtonElement | null>
  variant: "default" | "card"
}>({
  errors: [],
  registerOption: () => {},
  unregisterOption: () => {},
  values: [],
  handleChange: () => {},
  inputRef: { current: null },
  variant: "default",
})

interface DataFormCheckboxProps extends React.PropsWithChildren {
  value?: string[]
  defaultValue?: string[]
  onChange?: (value: string[]) => void
  scrollYOffset?: number
  className?: string
  variant?: "default" | "card"
}

export function DataFormCheckbox({
  value: propValue,
  defaultValue,
  onChange,
  scrollYOffset,
  className,
  children,
  variant = "default",
}: DataFormCheckboxProps) {
  const isControlled = propValue !== undefined
  const [internalValue, setInternalValue] = useState<string[]>(
    defaultValue || []
  )
  const value = isControlled ? propValue : internalValue

  const { name, required } = useContext(DataFormFieldContext)
  const { register, unregister, setValidation, setValue, getErrors } =
    useContext(DataFormContext)

  const inputRef = useRef<HTMLButtonElement>(null)
  const valueRef = useRef<{ setValue: (value: TDataValue) => void }>(null)
  const errors = getErrors(name)

  const [options, setOptions] = useState<string[]>([])

  // biome-ignore lint/correctness/useExhaustiveDependencies: we only want to run this on mount/unmount
  useEffect(() => {
    let schema: z.ZodArray<z.ZodString> | undefined

    schema = z.array(z.string(), { error: "Input tidak valid" })
    if (required) {
      schema = schema.min(1, "Wajib diisi")
    }

    register({
      name,
      defaultValue: value || [],
      ref: inputRef,
      valueRef,
      validation: schema,
      scrollYOffset,
    })

    return () => {
      unregister(name)
    }
  }, [name])

  // biome-ignore lint/correctness/useExhaustiveDependencies: we only want to run this on mount/unmount
  useEffect(() => {
    let schema:
      | z.ZodArray<z.ZodUnion<z.ZodLiteral<string>[]>>
      | z.ZodArray<z.ZodString>
      | undefined

    if (options.length > 0) {
      schema = z.array(
        z.union(
          options.map((opt) => z.literal(opt)),
          { error: "Input tidak valid" }
        )
      )
      if (required) {
        schema = schema.min(1, "Wajib diisi")
      }
    } else {
      schema = z.array(z.string(), { error: "Input tidak valid" })
      if (required) {
        schema = schema.min(1, "Wajib diisi")
      }
    }

    if (schema) {
      setValidation(name, schema)
    }
  }, [options])

  useImperativeHandle(valueRef, () => ({
    setValue: (value) => {
      if (!isControlled) setInternalValue(value as string[])
      onChange?.(value as string[])
    },
  }))

  function registerOption(option: string, checked: boolean) {
    setOptions((prev) => {
      if (prev.includes(option)) return prev
      return [...prev, option]
    })

    if (checked && !value.includes(option)) {
      const newValue = [...value, option]
      if (!isControlled) {
        setInternalValue(newValue)
      }
      onChange?.(newValue)
      setValue(name, newValue)
    }
  }

  function unregisterOption(option: string) {
    setOptions((prev) => prev.filter((opt) => opt !== option))
  }

  function handleChange(option: string, checked: boolean) {
    let newValue: string[] = []
    if (checked) {
      if (value.includes(option)) return
      newValue = [...value, option]
    } else {
      newValue = value.filter((v) => v !== option)
    }

    if (!isControlled) {
      setInternalValue(newValue)
    }
    onChange?.(newValue)
    setValue(name, newValue)
  }

  return (
    <DataFormCheckboxContext.Provider
      value={{
        errors,
        registerOption,
        unregisterOption,
        values: value,
        handleChange,
        inputRef,
        variant,
      }}>
      <FieldGroup className={cn("gap-3", className)}>{children}</FieldGroup>
    </DataFormCheckboxContext.Provider>
  )
}

interface DataFormCheckboxItemProps extends React.PropsWithChildren {
  value: string
  sublabel?: string
  description?: React.ReactNode
  className?: string
  disabled?: boolean
}

export function DataFormCheckboxItem({
  value,
  sublabel,
  description,
  className,
  disabled,
  children,
}: DataFormCheckboxItemProps) {
  const id = useId()

  const {
    errors,
    registerOption,
    unregisterOption,
    values,
    handleChange,
    inputRef,
    variant,
  } = useContext(DataFormCheckboxContext)

  // biome-ignore lint/correctness/useExhaustiveDependencies: we only want to run this on mount/unmount
  useEffect(() => {
    registerOption(value, values.includes(value))

    return () => {
      unregisterOption(value)
    }
  }, [])

  function handleCheckedChange(checked: CheckedState) {
    if (typeof checked === "boolean") {
      handleChange(value, checked)
    } else {
      handleChange(value, false)
    }
  }

  if (variant === "card") {
    return (
      <FieldLabel className={className} htmlFor={id}>
        <Field data-invalid={errors.length > 0} orientation="horizontal">
          <FieldContent>
            <FieldTitle className={cn(sublabel && "block")}>
              {children}{" "}
              {sublabel ? (
                <span className="font-normal text-muted-foreground text-xs leading-[inherit]">
                  {sublabel}
                </span>
              ) : null}
            </FieldTitle>
            {description ? (
              <FieldDescription>{description}</FieldDescription>
            ) : null}
          </FieldContent>
          <Checkbox
            aria-invalid={errors.length > 0 || undefined}
            checked={values.includes(value)}
            disabled={disabled}
            id={id}
            onCheckedChange={handleCheckedChange}
            ref={inputRef}
          />
        </Field>
      </FieldLabel>
    )
  }

  return (
    <Field data-invalid={errors.length > 0} orientation="horizontal">
      <Checkbox
        aria-invalid={errors.length > 0 || undefined}
        checked={values.includes(value)}
        disabled={disabled}
        id={id}
        onCheckedChange={handleCheckedChange}
        ref={inputRef}
      />
      <FieldLabel
        className={cn("font-normal", sublabel && "block", className)}
        htmlFor={id}>
        {children}{" "}
        {sublabel ? (
          <span className="font-normal text-muted-foreground text-xs leading-[inherit]">
            {sublabel}
          </span>
        ) : null}
      </FieldLabel>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
    </Field>
  )
}

interface DataFormImageProps {
  accept?: SingleImageAccept[]
  value?: FileWithPreview[]
  defaultValue?: string[]
  onChange?: (files: FileWithPreview[]) => void
  multiple?: boolean
  maxFiles?: number
  maxSizeMB?: number
  placeholder?: string
  scrollYOffset?: number
  className?: string
}

export function DataFormImage({
  accept,
  value: propValue,
  defaultValue,
  onChange,
  multiple = false,
  maxFiles,
  maxSizeMB,
  placeholder,
  scrollYOffset,
  className,
}: DataFormImageProps) {
  const vId = useId()

  const isControlled = propValue !== undefined
  const [internalValue, setInternalValue] = useState<FileWithPreview[]>(
    defaultValue
      ? defaultValue.map((v, i) => {
          const id = `${vId}-${v}-${i}`
          return {
            id,
            file: {
              id,
              name: v,
              type: "image/*",
              size: 0,
              url: v,
            },
            preview: v,
          }
        })
      : []
  )
  const value = isControlled ? propValue : internalValue

  const { name, required } = useContext(DataFormFieldContext)
  const { register, unregister, setValue, getErrors } =
    useContext(DataFormContext)

  const inputRef = useRef<HTMLDivElement>(null)
  const valueRef = useRef<{ setValue: (value: TDataValue) => void }>(null)
  const errors = getErrors(name)

  // biome-ignore lint/correctness/useExhaustiveDependencies: we only want to run this on mount/unmount
  useEffect(() => {
    let schema = z.array(
      z.union([
        z.file().refine((file) => file.type.startsWith("image/"), {
          error: "Masukkan file yang valid",
        }),
        z.string(),
      ]),
      { error: "Masukkan file yang valid" }
    )

    if (required) {
      schema = schema.min(1, "Wajib diisi")
    }

    register({
      name,
      ref: inputRef,
      valueRef,
      defaultValue: defaultValue || [],
      validation: schema,
      scrollYOffset,
    })

    return () => {
      unregister(name)
    }
  }, [name])

  useImperativeHandle(valueRef, () => ({
    setValue: (value) => {
      if (!isControlled) setInternalValue(value as FileWithPreview[])
      onChange?.(value as FileWithPreview[])
    },
  }))

  function handleFilesAdded(files: FileWithPreview[]) {
    if (!isControlled) setInternalValue(files)
    onChange?.(files)
    setValue(
      name,
      files.map(({ file }) => file)
    )
  }

  function handleFileRemoved(file: FileWithPreview) {
    if (!isControlled)
      setInternalValue((prev) => prev.filter((f) => f.id !== file.id))
    onChange?.(value.filter((f) => f.id !== file.id))
    setValue(
      name,
      value.filter((f) => f.id !== file.id).map(({ file }) => file)
    )
  }

  function handleAllFilesRemoved() {
    if (!isControlled) setInternalValue([])
    onChange?.([])
    setValue(name, [])
  }

  return (
    <ImageUpload
      accept={accept}
      aria-invalid={errors.length > 0 || undefined}
      className={className}
      files={value}
      id={name}
      maxFiles={maxFiles}
      maxSizeMB={maxSizeMB}
      multiple={multiple}
      onAllFilesRemoved={handleAllFilesRemoved}
      onFileRemoved={handleFileRemoved}
      onFilesAdded={handleFilesAdded}>
      <ImageUploadPreview
        ref={inputRef}
        variant={errors.length > 0 ? "destructive" : "default"}
      />
      <ImageUploadDropArea placeholder={placeholder} ref={inputRef} />
    </ImageUpload>
  )
}

interface DataFormVideoProps {
  accept?: SingleVideoAccept[]
  value?: FileWithPreview[]
  defaultValue?: string[]
  onChange?: (files: FileWithPreview[]) => void
  multiple?: boolean
  maxFiles?: number
  maxSizeMB?: number
  placeholder?: string
  scrollYOffset?: number
  className?: string
}

export function DataFormVideo({
  accept,
  value: propValue,
  defaultValue,
  onChange,
  multiple = false,
  maxFiles,
  maxSizeMB,
  placeholder,
  scrollYOffset,
  className,
}: DataFormVideoProps) {
  const vId = useId()

  const isControlled = propValue !== undefined
  const [internalValue, setInternalValue] = useState<FileWithPreview[]>(
    defaultValue
      ? defaultValue.map((v, i) => {
          const id = `${vId}-${v}-${i}`
          return {
            id,
            file: {
              id,
              name: v,
              type: "video/*",
              size: 0,
              url: v,
            },
            preview: v,
          }
        })
      : []
  )
  const value = isControlled ? propValue : internalValue

  const { name, required } = useContext(DataFormFieldContext)
  const { register, unregister, setValue, getErrors } =
    useContext(DataFormContext)

  const inputRef = useRef<HTMLDivElement>(null)
  const valueRef = useRef<{ setValue: (value: TDataValue) => void }>(null)
  const errors = getErrors(name)

  // biome-ignore lint/correctness/useExhaustiveDependencies: we only want to run this on mount/unmount
  useEffect(() => {
    let schema = z.array(
      z.union([
        z.file().refine((file) => file.type.startsWith("video/"), {
          error: "Masukkan file yang valid",
        }),
        z.string(),
      ]),
      {
        error: "Masukkan file yang valid",
      }
    )

    if (required) {
      schema = schema.min(1, "Wajib diisi")
    }

    register({
      name,
      ref: inputRef,
      valueRef,
      defaultValue: defaultValue || [],
      validation: schema,
      scrollYOffset,
    })

    return () => {
      unregister(name)
    }
  }, [name])

  useImperativeHandle(valueRef, () => ({
    setValue: (value) => {
      if (!isControlled) setInternalValue(value as FileWithPreview[])
      onChange?.(value as FileWithPreview[])
    },
  }))

  function handleFilesAdded(files: FileWithPreview[]) {
    if (!isControlled) setInternalValue(files)
    onChange?.(files)
    setValue(
      name,
      files.map(({ file }) => file)
    )
  }

  function handleFileRemoved(file: FileWithPreview) {
    if (!isControlled)
      setInternalValue((prev) => prev.filter((f) => f.id !== file.id))
    onChange?.(value.filter((f) => f.id !== file.id))
    setValue(
      name,
      value.filter((f) => f.id !== file.id).map(({ file }) => file)
    )
  }

  function handleAllFilesRemoved() {
    if (!isControlled) setInternalValue([])
    onChange?.([])
    setValue(name, [])
  }

  return (
    <VideoUpload
      accept={accept}
      aria-invalid={errors.length > 0 || undefined}
      className={className}
      files={value}
      id={name}
      maxFiles={maxFiles}
      maxSizeMB={maxSizeMB}
      multiple={multiple}
      onAllFilesRemoved={handleAllFilesRemoved}
      onFileRemoved={handleFileRemoved}
      onFilesAdded={handleFilesAdded}>
      <VideoUploadPreview
        ref={inputRef}
        variant={errors.length > 0 ? "destructive" : "default"}
      />
      <VideoUploadDropArea placeholder={placeholder} ref={inputRef} />
    </VideoUpload>
  )
}

interface DataFormAudioProps {
  accept?: SingleAudioAccept[]
  value?: FileWithPreview[]
  defaultValue?: string[]
  onChange?: (files: FileWithPreview[]) => void
  multiple?: boolean
  maxFiles?: number
  maxSizeMB?: number
  placeholder?: string
  scrollYOffset?: number
  className?: string
}

export function DataFormAudio({
  accept,
  value: propValue,
  defaultValue,
  onChange,
  multiple = false,
  maxFiles,
  maxSizeMB,
  placeholder,
  scrollYOffset,
  className,
}: DataFormAudioProps) {
  const vId = useId()

  const isControlled = propValue !== undefined
  const [internalValue, setInternalValue] = useState<FileWithPreview[]>(
    defaultValue
      ? defaultValue.map((v, i) => {
          const id = `${vId}-${v}-${i}`
          return {
            id,
            file: {
              id,
              name: v,
              type: "audio/*",
              size: 0,
              url: v,
            },
            preview: v,
          }
        })
      : []
  )
  const value = isControlled ? propValue : internalValue

  const { name, required } = useContext(DataFormFieldContext)
  const { register, unregister, setValue, getErrors } =
    useContext(DataFormContext)

  const inputRef = useRef<HTMLDivElement>(null)
  const valueRef = useRef<{ setValue: (value: TDataValue) => void }>(null)
  const errors = getErrors(name)

  // biome-ignore lint/correctness/useExhaustiveDependencies: we only want to run this on mount/unmount
  useEffect(() => {
    let schema = z.array(
      z.union([
        z.file().refine((file) => file.type.startsWith("audio/"), {
          error: "Masukkan file yang valid",
        }),
        z.string(),
      ]),
      {
        error: "Masukkan file yang valid",
      }
    )

    if (required) {
      schema = schema.min(1, "Wajib diisi")
    }

    register({
      name,
      ref: inputRef,
      valueRef,
      defaultValue: defaultValue || [],
      validation: schema,
      scrollYOffset,
    })

    return () => {
      unregister(name)
    }
  }, [name])

  useImperativeHandle(valueRef, () => ({
    setValue: (value) => {
      if (!isControlled) setInternalValue(value as FileWithPreview[])
      onChange?.(value as FileWithPreview[])
    },
  }))

  function handleFilesAdded(files: FileWithPreview[]) {
    if (!isControlled) setInternalValue(files)
    onChange?.(files)
    setValue(
      name,
      files.map(({ file }) => file)
    )
  }

  function handleFileRemoved(file: FileWithPreview) {
    if (!isControlled)
      setInternalValue((prev) => prev.filter((f) => f.id !== file.id))
    onChange?.(value.filter((f) => f.id !== file.id))
    setValue(
      name,
      value.filter((f) => f.id !== file.id).map(({ file }) => file)
    )
  }

  function handleAllFilesRemoved() {
    if (!isControlled) setInternalValue([])
    onChange?.([])
    setValue(name, [])
  }

  return (
    <AudioUpload
      accept={accept}
      aria-invalid={errors.length > 0 || undefined}
      className={className}
      files={value}
      id={name}
      maxFiles={maxFiles}
      maxSizeMB={maxSizeMB}
      multiple={multiple}
      onAllFilesRemoved={handleAllFilesRemoved}
      onFileRemoved={handleFileRemoved}
      onFilesAdded={handleFilesAdded}>
      <AudioUploadPreview
        ref={inputRef}
        variant={errors.length > 0 ? "destructive" : "default"}
      />
      <AudioUploadDropArea placeholder={placeholder} ref={inputRef} />
    </AudioUpload>
  )
}

interface DataFormPdfProps {
  value?: FileWithPreview[]
  defaultValue?: string[]
  onChange?: (files: FileWithPreview[]) => void
  multiple?: boolean
  maxFiles?: number
  maxSizeMB?: number
  placeholder?: string
  scrollYOffset?: number
  className?: string
}

export function DataFormPdf({
  value: propValue,
  defaultValue,
  onChange,
  multiple = false,
  maxFiles,
  maxSizeMB,
  placeholder,
  scrollYOffset,
  className,
}: DataFormPdfProps) {
  const vId = useId()

  const isControlled = propValue !== undefined
  const [internalValue, setInternalValue] = useState<FileWithPreview[]>(
    defaultValue
      ? defaultValue.map((v, i) => {
          const id = `${vId}-${v}-${i}`
          return {
            id,
            file: {
              id,
              name: v,
              type: "application/pdf",
              size: 0,
              url: v,
            },
            preview: v,
          }
        })
      : []
  )
  const value = isControlled ? propValue : internalValue

  const { name, required } = useContext(DataFormFieldContext)
  const { register, unregister, setValue, getErrors } =
    useContext(DataFormContext)

  const inputRef = useRef<HTMLDivElement>(null)
  const valueRef = useRef<{ setValue: (value: TDataValue) => void }>(null)
  const errors = getErrors(name)

  // biome-ignore lint/correctness/useExhaustiveDependencies: we only want to run this on mount/unmount
  useEffect(() => {
    let schema = z.array(
      z.union([
        z.file().mime("application/pdf", { error: "Masukkan file yang valid" }),
        z.string(),
      ]),
      { error: "Masukkan file yang valid" }
    )

    if (required) {
      schema = schema.min(1, "Wajib diisi")
    }

    register({
      name,
      ref: inputRef,
      valueRef,
      defaultValue: defaultValue || [],
      validation: schema,
      scrollYOffset,
    })

    return () => {
      unregister(name)
    }
  }, [name])

  useImperativeHandle(valueRef, () => ({
    setValue: (value) => {
      if (!isControlled) setInternalValue(value as FileWithPreview[])
      onChange?.(value as FileWithPreview[])
    },
  }))

  function handleFilesAdded(files: FileWithPreview[]) {
    if (!isControlled) setInternalValue(files)
    onChange?.(files)
    setValue(
      name,
      files.map(({ file }) => file)
    )
  }

  function handleFileRemoved(file: FileWithPreview) {
    if (!isControlled)
      setInternalValue((prev) => prev.filter((f) => f.id !== file.id))
    onChange?.(value.filter((f) => f.id !== file.id))
    setValue(
      name,
      value.filter((f) => f.id !== file.id).map(({ file }) => file)
    )
  }

  function handleAllFilesRemoved() {
    if (!isControlled) setInternalValue([])
    onChange?.([])
    setValue(name, [])
  }

  return (
    <PdfUpload
      aria-invalid={errors.length > 0 || undefined}
      className={className}
      files={value}
      id={name}
      maxFiles={maxFiles}
      maxSizeMB={maxSizeMB}
      multiple={multiple}
      onAllFilesRemoved={handleAllFilesRemoved}
      onFileRemoved={handleFileRemoved}
      onFilesAdded={handleFilesAdded}>
      <PdfUploadPreview
        ref={inputRef}
        variant={errors.length > 0 ? "destructive" : "default"}
      />
      <PdfUploadDropArea placeholder={placeholder} ref={inputRef} />
    </PdfUpload>
  )
}

interface DataFormFileProps {
  value?: FileWithPreview[]
  defaultValue?: string[]
  onChange?: (files: FileWithPreview[]) => void
  accept?: SingleFileAccept[]
  multiple?: boolean
  maxFiles?: number
  maxSizeMB?: number
  placeholder?: string
  scrollYOffset?: number
  className?: string
}

export function DataFormFile({
  value: propValue,
  defaultValue,
  onChange,
  accept,
  multiple = false,
  maxFiles,
  maxSizeMB,
  placeholder,
  scrollYOffset,
  className,
}: DataFormFileProps) {
  const vId = useId()

  const isControlled = propValue !== undefined
  const [internalValue, setInternalValue] = useState<FileWithPreview[]>(
    defaultValue
      ? defaultValue.map((v, i) => {
          const id = `${vId}-${v}-${i}`
          return {
            id,
            file: {
              id,
              name: v,
              type: "*",
              size: 0,
              url: v,
            },
            preview: v,
          }
        })
      : []
  )
  const value = isControlled ? propValue : internalValue

  const { name, required } = useContext(DataFormFieldContext)
  const { register, unregister, setValue, getErrors } =
    useContext(DataFormContext)

  const inputRef = useRef<HTMLDivElement>(null)
  const valueRef = useRef<{ setValue: (value: TDataValue) => void }>(null)
  const errors = getErrors(name)

  // biome-ignore lint/correctness/useExhaustiveDependencies: we only want to run this on mount/unmount
  useEffect(() => {
    let schema = z.array(z.union([z.file(), z.string()]), {
      error: "Masukkan file yang valid",
    })

    if (required) {
      schema = schema.min(1, "Wajib diisi")
    }

    register({
      name,
      ref: inputRef,
      valueRef,
      defaultValue: defaultValue || [],
      validation: schema,
      scrollYOffset,
    })

    return () => {
      unregister(name)
    }
  }, [name])

  useImperativeHandle(valueRef, () => ({
    setValue: (value) => {
      if (!isControlled) setInternalValue(value as FileWithPreview[])
      onChange?.(value as FileWithPreview[])
    },
  }))

  function handleFilesAdded(files: FileWithPreview[]) {
    if (!isControlled) setInternalValue(files)
    onChange?.(files)
    setValue(
      name,
      files.map(({ file }) => file)
    )
  }

  function handleFileRemoved(file: FileWithPreview) {
    if (!isControlled)
      setInternalValue((prev) => prev.filter((f) => f.id !== file.id))
    onChange?.(value.filter((f) => f.id !== file.id))
    setValue(
      name,
      value.filter((f) => f.id !== file.id).map(({ file }) => file)
    )
  }

  function handleAllFilesRemoved() {
    if (!isControlled) setInternalValue([])
    onChange?.([])
    setValue(name, [])
  }

  return (
    <FileUpload
      accept={accept}
      aria-invalid={errors.length > 0 || undefined}
      className={className}
      files={value}
      id={name}
      maxFiles={maxFiles}
      maxSizeMB={maxSizeMB}
      multiple={multiple}
      onAllFilesRemoved={handleAllFilesRemoved}
      onFileRemoved={handleFileRemoved}
      onFilesAdded={handleFilesAdded}>
      <FileUploadPreview
        ref={inputRef}
        variant={errors.length > 0 ? "destructive" : "default"}
      />
      <FileUploadDropArea placeholder={placeholder} ref={inputRef} />
    </FileUpload>
  )
}

interface DataFormDateProps {
  align?: "start" | "center" | "end"
  value?: Date | null
  defaultValue?: Date
  onChange?: (value: Date | null) => void
  placeholder?: string
  scrollYOffset?: number
  className?: string
  disabled?: boolean
}

export function DataFormDate({
  align,
  value: propValue,
  defaultValue,
  onChange,
  placeholder,
  scrollYOffset,
  className,
  disabled,
}: DataFormDateProps) {
  const isControlled = propValue !== undefined
  const [internalValue, setInternalValue] = useState<Date | null | undefined>(
    defaultValue
  )
  const value = isControlled ? propValue : internalValue

  const { name, required } = useContext(DataFormFieldContext)
  const { register, unregister, setValue, getErrors } =
    useContext(DataFormContext)

  const inputRef = useRef<HTMLButtonElement>(null)
  const valueRef = useRef<{ setValue: (value: TDataValue) => void }>(null)
  const errors = getErrors(name)

  // biome-ignore lint/correctness/useExhaustiveDependencies: we only want to run this on mount/unmount
  useEffect(() => {
    let schema: z.ZodDate | z.ZodNullable<z.ZodDate> = z.date({
      error: "Wajib diisi",
    })

    if (!required) {
      schema = schema.nullable()
    }

    register({
      name,
      defaultValue: value,
      ref: inputRef,
      valueRef,
      validation: schema,
      scrollYOffset,
    })

    return () => {
      unregister(name)
    }
  }, [name])

  useImperativeHandle(valueRef, () => ({
    setValue: (value) => {
      const v = (value as Date | undefined) ?? null
      if (!isControlled) setInternalValue(v)
      onChange?.(v)
    },
  }))

  function handleSelectedDate(date: Date | null) {
    if (!isControlled) setInternalValue(date)
    onChange?.(date)
    setValue(name, date)
  }

  return (
    <DatePicker
      align={align}
      aria-invalid={errors.length > 0 || undefined}
      className={className}
      disabled={disabled}
      id={name}
      name={name}
      onSelectDate={handleSelectedDate}
      placeholder={placeholder}
      ref={inputRef}
      selected={value}
    />
  )
}

interface DataFormDateRangeProps {
  align?: "start" | "center" | "end"
  value?: DateRange | null
  defaultValue?: DateRange
  onChange?: (value: DateRange | null) => void
  placeholder?: string
  scrollYOffset?: number
  className?: string
  disabled?: boolean
}

export function DataFormDateRange({
  align,
  value: propValue,
  defaultValue,
  onChange,
  placeholder,
  scrollYOffset,
  className,
  disabled,
}: DataFormDateRangeProps) {
  const isControlled = propValue !== undefined
  const [internalValue, setInternalValue] = useState<
    DateRange | null | undefined
  >(defaultValue)
  const value = isControlled ? propValue : internalValue

  const { name, required } = useContext(DataFormFieldContext)
  const { register, unregister, setValue, getErrors } =
    useContext(DataFormContext)

  const inputRef = useRef<HTMLButtonElement>(null)
  const valueRef = useRef<{ setValue: (value: TDataValue) => void }>(null)
  const errors = getErrors(name)

  // biome-ignore lint/correctness/useExhaustiveDependencies: we only want to run this on mount/unmount
  useEffect(() => {
    let schema: z.ZodType<DateRange> | z.ZodNullable<z.ZodType<DateRange>> =
      z.object({
        from: z.date(),
        to: z.date().optional(),
      })

    if (!required) {
      schema = schema.nullable()
    }

    register({
      name,
      defaultValue: value,
      ref: inputRef,
      valueRef,
      validation: schema,
      scrollYOffset,
    })

    return () => {
      unregister(name)
    }
  }, [name])

  useImperativeHandle(valueRef, () => ({
    setValue: (value) => {
      const v = (value as DateRange | undefined) ?? null
      if (!isControlled) setInternalValue(v)
      onChange?.(v)
    },
  }))

  function handleSelectedRange(range: DateRange | null) {
    if (!isControlled) setInternalValue(range)
    onChange?.(range)
    setValue(name, range)
  }

  return (
    <DateRangePicker
      align={align}
      aria-invalid={errors.length > 0 || undefined}
      className={className}
      disabled={disabled}
      id={name}
      name={name}
      onSelectRange={handleSelectedRange}
      placeholder={placeholder}
      ref={inputRef}
      selected={value}
    />
  )
}

interface DataFormEditorProps {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  scrollYOffset?: number
  className?: string
  disabled?: boolean
}

export function DataFormEditor({
  value: propValue,
  defaultValue = "",
  onChange,
  scrollYOffset,
  className,
  disabled,
}: DataFormEditorProps) {
  const isControlled = propValue !== undefined
  const [internalValue, setInternalValue] = useState<string>(defaultValue)
  const value = isControlled ? propValue : internalValue

  const { name, required } = useContext(DataFormFieldContext)
  const { register, unregister, setValue, getErrors } =
    useContext(DataFormContext)

  const inputRef = useRef<HTMLDivElement>(null)
  const valueRef = useRef<{ setValue: (value: TDataValue) => void }>(null)
  const errors = getErrors(name)

  // biome-ignore lint/correctness/useExhaustiveDependencies: we only want to run this on mount/unmount
  useEffect(() => {
    const schema = z
      .string()
      .nonempty({ message: "Wajib diisi" })
      .refine((val) => val !== "<p></p>", { message: "Wajib diisi" })

    register({
      name,
      defaultValue: value,
      ref: inputRef,
      valueRef,
      validation: required ? schema : undefined,
      scrollYOffset,
    })

    return () => {
      unregister(name)
    }
  }, [name])

  useImperativeHandle(valueRef, () => ({
    setValue: (value) => {
      const v = value as string
      if (!isControlled) setInternalValue(v)
      onChange?.(v)
    },
  }))

  function handleEditorChange(value: string) {
    if (!isControlled) setInternalValue(value)
    onChange?.(value)
    setValue(name, value)
  }

  return (
    <Tiptap
      aria-invalid={errors.length > 0 || undefined}
      className={className}
      content={value}
      disabled={disabled}
      id={name}
      name={name}
      onUpdate={handleEditorChange}
      ref={inputRef}
    />
  )
}

interface DataFormActionProps extends React.PropsWithChildren {
  align?: "left" | "center" | "right"
}

export function DataFormAction({
  align = "right",
  children,
}: DataFormActionProps) {
  return (
    <Field
      className={cn(
        align === "left" && "justify-start",
        align === "center" && "justify-center",
        align === "right" && "justify-end"
      )}
      orientation="horizontal">
      {children}
    </Field>
  )
}

interface DataFormCancelProps extends React.PropsWithChildren {
  onClick?: () => void
  asChild?: boolean
}

export function DataFormCancel({
  onClick,
  asChild = false,
  children,
}: DataFormCancelProps) {
  return (
    <Button asChild={asChild} onClick={onClick} type="button" variant="outline">
      {children}
    </Button>
  )
}

interface DataFormSubmitProps extends React.PropsWithChildren {
  ref?: React.Ref<HTMLButtonElement>
  asChild?: boolean
  className?: string
}

export function DataFormSubmit({
  ref,
  asChild = false,
  className,
  children,
}: DataFormSubmitProps) {
  const { isPending } = useContext(DataFormContext)

  return (
    <Button
      asChild={asChild}
      className={className}
      disabled={isPending}
      ref={ref}
      type="submit">
      {isPending ? <Spinner /> : null}
      {children}
    </Button>
  )
}

// function createDataFormInput<T extends TDataType>() {
//   function DataFormInputTyped(props: DataFormInputProps<T>) {
//     return <DataFormInput<T> {...props} />
//   }

//   return DataFormInputTyped
// }

function createDataFormField<T extends TDataType>() {
  function DataFormFieldTyped(props: DataFormFieldProps<T>) {
    return <DataFormField<T> {...props} />
  }

  return DataFormFieldTyped
}

export function createDataForm<T extends TDataType>() {
  function DataFormTyped(props: DataFormProps<T>) {
    return <DataForm<T> {...props} />
  }

  // DataFormTyped.Input = createDataFormInput<T>()
  DataFormTyped.Field = createDataFormField<T>()

  return DataFormTyped
}
