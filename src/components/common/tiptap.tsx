"use client"

import { Highlight } from "@tiptap/extension-highlight"
import { HorizontalRule } from "@tiptap/extension-horizontal-rule"
import { Image } from "@tiptap/extension-image"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { TextAlign } from "@tiptap/extension-text-align"
import { Color, TextStyle } from "@tiptap/extension-text-style"
import { Typography } from "@tiptap/extension-typography"
import { Selection } from "@tiptap/extensions"
import {
  type Content,
  type Editor,
  EditorContent,
  EditorContext,
  useCurrentEditor,
  useEditor,
  useEditorState,
} from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  ChevronDownIcon,
  Code2Icon,
  CodeIcon,
  HeadingIcon,
  ItalicIcon,
  ListIcon,
  MinusIcon,
  Redo2Icon,
  RemoveFormattingIcon,
  StrikethroughIcon,
  TextQuoteIcon,
  UnderlineIcon,
  Undo2Icon,
} from "lucide-react"
import React, { useImperativeHandle, useRef } from "react"
import { cn } from "@/lib/utils"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Separator } from "../ui/separator"
import { Toggle } from "../ui/toggle"

interface BaseTiptapProps {
  id?: string
  name?: string
  ref?: React.RefObject<HTMLDivElement | null>
  className?: string
  disabled?: boolean
  "aria-invalid"?: boolean
}

type HtmlTextOutput = {
  content?: string
  onUpdate?: (content: string) => void
  /**
   * @description
   * Default to "html" if not specified.
   */
  output?: "html" | "text"
}

type JsonOutput = {
  content?: Content
  onUpdate?: (content: Content) => void
  /**
   * @description
   * Default to "html" if not specified.
   */
  output?: "json"
}

type TiptapProps = BaseTiptapProps & (HtmlTextOutput | JsonOutput)

export default function Tiptap({
  id,
  ref,
  name,
  className,
  disabled,
  "aria-invalid": ariaInvalid,
  content,
  onUpdate,
  output,
}: TiptapProps) {
  const localRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Selection,
      Color,
      TextStyle,
    ],
    content,
    onUpdate: ({ editor }) => {
      if (output === "html") {
        onUpdate?.(editor.getHTML())
        return
      }

      if (output === "text") {
        onUpdate?.(editor.getText())
        return
      }

      if (output === "json") {
        onUpdate?.(editor.getJSON())
        return
      }

      onUpdate?.(editor.getHTML())
    },
    immediatelyRender: false,
    editable: !disabled,
    editorProps: {
      attributes: {
        ...(!disabled ? { tabindex: "0" } : {}),
        ...(ariaInvalid ? { "aria-invalid": "true" } : {}),
        "data-slot": "input-editor",
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class:
          "px-12 pt-12 pb-20 flex-1 outline-none prose prose-code:before:content-none prose-code:after:content-none prose-code:bg-muted prose-code:p-1 prose-code:rounded prose-pre:prose-code:bg-inherit prose-pre:prose-code:p-0 prose-pre:prose-code:rounded-none prose-blockquote:prose-p:before:content-none prose-blockquote:prose-p:after:content-none",
      },
    },
  })

  useImperativeHandle(ref, () => {
    const dom = localRef.current
    if (!dom) {
      return null!
    }

    return Object.assign(dom, {
      focus: () => {
        editor?.commands.focus()
      },
    }) as HTMLDivElement
  }, [editor])

  return (
    <div
      className={cn(
        "flex w-full overflow-hidden rounded-lg border",
        "has-[[data-slot=input-editor]:focus-visible]:border-ring has-[[data-slot=input-editor]:focus-visible]:ring-[3px] has-[[data-slot=input-editor]:focus-visible]:ring-ring/50",
        "has-[[data-slot=input-editor][aria-invalid=true]]:border-destructive has-[[data-slot=input-editor][aria-invalid=true]]:ring-destructive/20 dark:has-[[data-slot=input-editor][aria-invalid=true]]:ring-destructive/40",
        disabled && "pointer-events-none opacity-50",
        className
      )}>
      <div className="h-96 w-full overflow-auto">
        <EditorContext.Provider value={{ editor }}>
          <div
            className={cn(
              "sticky top-0 z-10 flex h-[41px] items-center gap-1 overflow-hidden overflow-x-auto border-b bg-background py-1"
            )}>
            <div className="flex-1"></div>

            <UndoButton disabled={disabled} />
            <RedoButton disabled={disabled} />
            <div className="h-full py-1">
              <Separator orientation="vertical" />
            </div>
            <HeadingsDropdown disabled={disabled} />
            <div className="h-full py-1">
              <Separator orientation="vertical" />
            </div>
            <BoldToggle disabled={disabled} />
            <ItalicToggle disabled={disabled} />
            <UnderlineToggle disabled={disabled} />
            <StrikethroughToggle disabled={disabled} />
            <CodeToggle disabled={disabled} />
            <RemoveFormattingButton disabled={disabled} />
            <div className="h-full py-1">
              <Separator orientation="vertical" />
            </div>
            <ColorPicker disabled={disabled} />
            <div className="h-full py-1">
              <Separator orientation="vertical" />
            </div>
            <ListsDropdown disabled={disabled} />
            <div className="h-full py-1">
              <Separator orientation="vertical" />
            </div>
            {/* <Button size="icon-sm" title="Link" variant="ghost">
              <Link2Icon />
            </Button>
            <Button size="icon-sm" title="Image" variant="ghost">
              <ImageIcon />
            </Button> */}
            <CodeBlockToggle disabled={disabled} />
            <BlockquoteToggle disabled={disabled} />
            <HorizontalRuleButton disabled={disabled} />
            <div className="h-full py-1">
              <Separator orientation="vertical" />
            </div>
            <AlignLeftToggle disabled={disabled} />
            <AlignCenterToggle disabled={disabled} />
            <AlignRightToggle disabled={disabled} />
            <AlignJustifyToggle disabled={disabled} />
            <div className="flex-1"></div>
          </div>
          <EditorContent
            className="mx-auto flex h-full w-full max-w-2xl flex-1 flex-col"
            disabled={disabled}
            editor={editor}
            id={id}
            name={name}
            ref={localRef}
            role="presentation"
          />
        </EditorContext.Provider>
      </div>
    </div>
  )
}

interface UndoButtonProps {
  disabled?: boolean
}

function UndoButton({ disabled }: UndoButtonProps) {
  const { editor } = useTiptapEditor()

  const canUndo = editor?.can().undo() ?? false

  function handleClick() {
    if (editor?.isEditable) {
      const chain = editor.chain().focus()
      if (canUndo) {
        chain.undo().run()
      }
    }
  }

  return (
    <Button
      className="text-foreground"
      disabled={!canUndo || disabled}
      onClick={handleClick}
      size="icon-sm"
      title="Undo"
      type="button"
      variant="ghost">
      <Undo2Icon />
    </Button>
  )
}

interface RedoButtonProps {
  disabled?: boolean
}

function RedoButton({ disabled }: RedoButtonProps) {
  const { editor } = useTiptapEditor()

  const canRedo = editor?.can().redo() ?? false

  function handleClick() {
    if (editor?.isEditable) {
      const chain = editor.chain().focus()
      if (canRedo) {
        chain.redo().run()
      }
    }
  }

  return (
    <Button
      className="text-foreground"
      disabled={!canRedo || disabled}
      onClick={handleClick}
      size="icon-sm"
      title="Undo"
      type="button"
      variant="ghost">
      <Redo2Icon />
    </Button>
  )
}

interface HeadingsDropdownProps {
  disabled?: boolean
}

function HeadingsDropdown({ disabled }: HeadingsDropdownProps) {
  const { editor } = useTiptapEditor()

  const headingLevel = [1, 2, 3, 4, 5, 6].find((level) =>
    editor?.isActive("heading", { level })
  )

  const activeHeading = headingLevel
    ? `heading${headingLevel}`
    : editor?.isActive("paragraph")
      ? "paragraph"
      : undefined

  const handleHeadingChange = (value: string) => {
    if (editor?.isEditable) {
      const chain = editor.chain().focus()
      switch (value) {
        case "paragraph":
          chain.setParagraph().run()
          break
        case "heading1":
          chain.setHeading({ level: 1 }).run()
          break
        case "heading2":
          chain.setHeading({ level: 2 }).run()
          break
        case "heading3":
          chain.setHeading({ level: 3 }).run()
          break
        case "heading4":
          chain.setHeading({ level: 4 }).run()
          break
        case "heading5":
          chain.setHeading({ level: 5 }).run()
          break
        case "heading6":
          chain.setHeading({ level: 6 }).run()
          break
        default:
          break
      }
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="relative text-foreground"
          disabled={disabled}
          size="icon-sm"
          title="Headings"
          variant="ghost">
          <HeadingIcon className="mr-2.5" />
          <ChevronDownIcon className="absolute right-0.75 size-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={10}>
        <DropdownMenuRadioGroup
          onValueChange={handleHeadingChange}
          value={activeHeading}>
          <DropdownMenuRadioItem value="paragraph">
            Paragraph
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="heading1">
            Heading 1
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="heading2">
            Heading 2
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="heading3">
            Heading 3
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="heading4">
            Heading 4
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="heading5">
            Heading 5
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="heading6">
            Heading 6
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface BoldToggleProps {
  disabled?: boolean
}

function BoldToggle({ disabled }: BoldToggleProps) {
  const { editor } = useTiptapEditor()

  const isActive = editor?.isActive("bold") ?? false

  function handleClick() {
    if (editor?.isEditable) {
      editor.chain().focus().toggleBold().run()
    }
  }

  return (
    <Toggle
      className="text-foreground"
      disabled={disabled}
      onClick={handleClick}
      pressed={isActive}
      size="sm"
      title="Bold">
      <BoldIcon />
    </Toggle>
  )
}

interface ItalicToggleProps {
  disabled?: boolean
}

function ItalicToggle({ disabled }: ItalicToggleProps) {
  const { editor } = useTiptapEditor()
  const isActive = editor?.isActive("italic") ?? false

  function handleClick() {
    if (editor?.isEditable) {
      editor.chain().focus().toggleItalic().run()
    }
  }

  return (
    <Toggle
      className="text-foreground"
      disabled={disabled}
      onClick={handleClick}
      pressed={isActive}
      size="sm"
      title="Italic">
      <ItalicIcon />
    </Toggle>
  )
}

interface UnderlineToggleProps {
  disabled?: boolean
}

function UnderlineToggle({ disabled }: UnderlineToggleProps) {
  const { editor } = useTiptapEditor()
  const isActive = editor?.isActive("underline") ?? false

  function handleClick() {
    if (editor?.isEditable) {
      editor.chain().focus().toggleUnderline().run()
    }
  }

  return (
    <Toggle
      className="text-foreground"
      disabled={disabled}
      onClick={handleClick}
      pressed={isActive}
      size="sm"
      title="Underline">
      <UnderlineIcon />
    </Toggle>
  )
}

interface StrikethroughToggleProps {
  disabled?: boolean
}

function StrikethroughToggle({ disabled }: StrikethroughToggleProps) {
  const { editor } = useTiptapEditor()
  const isActive = editor?.isActive("strike") ?? false

  function handleClick() {
    if (editor?.isEditable) {
      editor.chain().focus().toggleStrike().run()
    }
  }

  return (
    <Toggle
      className="text-foreground"
      disabled={disabled}
      onClick={handleClick}
      pressed={isActive}
      size="sm"
      title="Strikethrough">
      <StrikethroughIcon />
    </Toggle>
  )
}

interface CodeToggleProps {
  disabled?: boolean
}

function CodeToggle({ disabled }: CodeToggleProps) {
  const { editor } = useTiptapEditor()
  const isActive = editor?.isActive("code") ?? false

  function handleClick() {
    if (editor?.isEditable) {
      editor.chain().focus().toggleCode().run()
    }
  }

  return (
    <Toggle
      className="text-foreground"
      disabled={disabled}
      onClick={handleClick}
      pressed={isActive}
      size="sm"
      title="Code">
      <CodeIcon />
    </Toggle>
  )
}

interface RemoveFormattingButtonProps {
  disabled?: boolean
}

function RemoveFormattingButton({ disabled }: RemoveFormattingButtonProps) {
  const { editor } = useTiptapEditor()

  function handleClick() {
    if (editor?.isEditable) {
      editor.chain().focus().clearNodes().unsetAllMarks().run()
    }
  }

  return (
    <Button
      className="text-foreground"
      disabled={disabled}
      onClick={handleClick}
      size="icon-sm"
      title="Remove Formatting"
      variant="ghost">
      <RemoveFormattingIcon />
    </Button>
  )
}

interface ColorPickerProps {
  disabled?: boolean
}

function ColorPicker({ disabled }: ColorPickerProps) {
  const { editor } = useTiptapEditor()

  const activeColor = editor?.getAttributes("textStyle").color || ""

  const palette1: [string, string][] = [
    ["", "Black"],
    ["var(--color-blue-900)", "Blue Dark"],
    ["var(--color-teal-900)", "Teal Dark"],
    ["var(--color-green-900)", "Green Dark"],
    ["var(--color-yellow-900)", "Yellow Dark"],
    ["var(--color-red-900)", "Red Dark"],
    ["var(--color-purple-900)", "Purple Dark"],
    ["var(--color-pink-900)", "Pink Dark"],
  ]

  const palette2: [string, string][] = [
    ["var(--color-slate-500)", "Slate"],
    ["var(--color-blue-500)", "Blue"],
    ["var(--color-teal-500)", "Teal"],
    ["var(--color-green-500)", "Green"],
    ["var(--color-yellow-500)", "Yellow"],
    ["var(--color-red-500)", "Red"],
    ["var(--color-purple-500)", "Purple"],
    ["var(--color-pink-500)", "Pink"],
  ]

  const palette3: [string, string][] = [
    ["var(--background)", "Background"],
    ["var(--color-blue-300)", "Blue Light"],
    ["var(--color-teal-300)", "Teal Light"],
    ["var(--color-green-300)", "Green Light"],
    ["var(--color-yellow-300)", "Yellow Light"],
    ["var(--color-red-300)", "Red Light"],
    ["var(--color-purple-300)", "Purple Light"],
    ["var(--color-pink-300)", "Pink Light"],
  ]

  function handleColorChange(color: string) {
    if (editor?.isEditable) {
      const marks = editor.state.storedMarks
      if (marks) {
        editor.view.dispatch(editor.state.tr.setStoredMarks(null))
      }

      requestAnimationFrame(() => {
        const chain = editor.chain().focus()

        if (color) {
          chain.setColor(color).run()
        } else {
          chain.unsetColor().run()
        }
      })
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="relative text-foreground"
          disabled={disabled}
          size="icon-sm"
          title="Text Color"
          variant="ghost">
          <span
            className={cn(
              "mr-2.5 size-2.5 rounded-full",
              !activeColor && "bg-foreground"
            )}
            style={{
              backgroundColor: activeColor,
            }}
          />
          <ChevronDownIcon className="absolute right-0.75 size-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-full p-2" sideOffset={10}>
        <div className="space-y-1.5">
          <div className="flex gap-1">
            {palette1.map(([color, label], i) => (
              <Button
                className="relative"
                key={color}
                onClick={() => handleColorChange(color)}
                size="icon-sm"
                title={label}
                variant="ghost">
                <span
                  className="size-5 rounded-full"
                  style={{
                    backgroundColor: i === 0 ? "var(--foreground)" : color,
                  }}
                />
                {activeColor === color ? (
                  <span
                    className={cn(
                      "-translate-x-1/2 -translate-y-1/2 absolute inset-0 top-1/2 left-1/2 size-2 rounded-full bg-background"
                    )}
                  />
                ) : null}
              </Button>
            ))}
          </div>
          <div className="flex gap-1">
            {palette2.map(([color, label]) => (
              <Button
                className="relative"
                key={color}
                onClick={() => handleColorChange(color)}
                size="icon-sm"
                title={label}
                variant="ghost">
                <span
                  className="size-5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {activeColor === color ? (
                  <span className="-translate-x-1/2 -translate-y-1/2 absolute inset-0 top-1/2 left-1/2 size-2 rounded-full bg-background" />
                ) : null}
              </Button>
            ))}
          </div>
          <div className="flex gap-1">
            {palette3.map(([color, label], i) => (
              <Button
                className="relative"
                key={color}
                onClick={() => handleColorChange(color)}
                size="icon-sm"
                title={label}
                variant="ghost">
                <span
                  className={cn("size-5 rounded-full", i === 0 && "border")}
                  style={{ backgroundColor: color }}
                />
                {activeColor === color ? (
                  <span
                    className={cn(
                      "-translate-x-1/2 -translate-y-1/2 absolute inset-0 top-1/2 left-1/2 size-2 rounded-full bg-background",
                      i === 0 && "bg-foreground"
                    )}
                  />
                ) : null}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

interface ListsDropdownProps {
  disabled?: boolean
}

function ListsDropdown({ disabled }: ListsDropdownProps) {
  const { editor } = useTiptapEditor()

  const activeList = ["bulletList", "orderedList", "taskList"].find((list) =>
    editor?.isActive(list)
  )

  function handleListChange(value: string) {
    if (editor?.isEditable) {
      const chain = editor.chain().focus()
      switch (value) {
        case "bulletList":
          chain.toggleBulletList().run()
          break
        case "orderedList":
          chain.toggleOrderedList().run()
          break
        case "taskList":
          chain.toggleTaskList().run()
          break
        default:
          break
      }
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="relative text-foreground"
          disabled={disabled}
          size="icon-sm"
          title="List"
          variant="ghost">
          <ListIcon className="mr-2.5" />
          <ChevronDownIcon className="absolute right-0.75 size-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={10}>
        <DropdownMenuRadioGroup
          onValueChange={handleListChange}
          value={activeList}>
          <DropdownMenuRadioItem value="bulletList">
            Bullet List
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="orderedList">
            Ordered List
          </DropdownMenuRadioItem>
          {/* <DropdownMenuRadioItem value="taskList">
            Task List
          </DropdownMenuRadioItem> */}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface CodeBlockToggleProps {
  disabled?: boolean
}

function CodeBlockToggle({ disabled }: CodeBlockToggleProps) {
  const { editor } = useTiptapEditor()
  const isActive = editor?.isActive("codeBlock") ?? false

  function handleClick() {
    if (editor?.isEditable) {
      editor.chain().focus().toggleCodeBlock().run()
    }
  }

  return (
    <Toggle
      className="text-foreground"
      disabled={disabled}
      onClick={handleClick}
      pressed={isActive}
      size="sm"
      title="Code Block">
      <Code2Icon />
    </Toggle>
  )
}

interface BlockquoteToggleProps {
  disabled?: boolean
}

function BlockquoteToggle({ disabled }: BlockquoteToggleProps) {
  const { editor } = useTiptapEditor()
  const isActive = editor?.isActive("blockquote") ?? false

  function handleClick() {
    if (editor?.isEditable) {
      editor.chain().focus().toggleBlockquote().run()
    }
  }

  return (
    <Toggle
      className="text-foreground"
      disabled={disabled}
      onClick={handleClick}
      pressed={isActive}
      size="sm"
      title="Blockquote">
      <TextQuoteIcon />
    </Toggle>
  )
}

interface HorizontalRuleButtonProps {
  disabled?: boolean
}

function HorizontalRuleButton({ disabled }: HorizontalRuleButtonProps) {
  const { editor } = useTiptapEditor()

  function handleClick() {
    if (editor?.isEditable) {
      editor.chain().focus().setHorizontalRule().run()
    }
  }

  return (
    <Button
      className="text-foreground"
      disabled={disabled}
      onClick={handleClick}
      size="icon-sm"
      title="Horizontal Rule"
      variant="ghost">
      <MinusIcon />
    </Button>
  )
}

interface AlignLeftToggleProps {
  disabled?: boolean
}

function AlignLeftToggle({ disabled }: AlignLeftToggleProps) {
  const { editor } = useTiptapEditor()
  const isActive = editor?.isActive({ textAlign: "left" }) ?? false

  function handleClick() {
    if (editor?.isEditable) {
      editor.chain().focus().setTextAlign("left").run()
    }
  }

  return (
    <Toggle
      className="text-foreground"
      disabled={disabled}
      onClick={handleClick}
      pressed={isActive}
      size="sm"
      title="Align Left">
      <AlignLeftIcon />
    </Toggle>
  )
}

interface AlignCenterToggleProps {
  disabled?: boolean
}

function AlignCenterToggle({ disabled }: AlignCenterToggleProps) {
  const { editor } = useTiptapEditor()
  const isActive = editor?.isActive({ textAlign: "center" }) ?? false

  function handleClick() {
    if (editor?.isEditable) {
      editor.chain().focus().setTextAlign("center").run()
    }
  }

  return (
    <Toggle
      className="text-foreground"
      disabled={disabled}
      onClick={handleClick}
      pressed={isActive}
      size="sm"
      title="Align Center">
      <AlignCenterIcon />
    </Toggle>
  )
}

interface AlignRightToggleProps {
  disabled?: boolean
}

function AlignRightToggle({ disabled }: AlignRightToggleProps) {
  const { editor } = useTiptapEditor()
  const isActive = editor?.isActive({ textAlign: "right" }) ?? false

  function handleClick() {
    if (editor?.isEditable) {
      editor.chain().focus().setTextAlign("right").run()
    }
  }

  return (
    <Toggle
      className="text-foreground"
      disabled={disabled}
      onClick={handleClick}
      pressed={isActive}
      size="sm"
      title="Align Right">
      <AlignRightIcon />
    </Toggle>
  )
}

interface AlignJustifyToggleProps {
  disabled?: boolean
}

function AlignJustifyToggle({ disabled }: AlignJustifyToggleProps) {
  const { editor } = useTiptapEditor()
  const isActive = editor?.isActive({ textAlign: "justify" }) ?? false

  function handleClick() {
    if (editor?.isEditable) {
      editor.chain().focus().setTextAlign("justify").run()
    }
  }

  return (
    <Toggle
      className="text-foreground"
      disabled={disabled}
      onClick={handleClick}
      pressed={isActive}
      size="sm"
      title="Justify">
      <AlignJustifyIcon />
    </Toggle>
  )
}

function useTiptapEditor(providedEditor?: Editor | null): {
  editor: Editor | null
  editorState?: Editor["state"]
  canCommand?: Editor["can"]
} {
  const { editor: coreEditor } = useCurrentEditor()
  const mainEditor = React.useMemo(
    () => providedEditor || coreEditor,
    [providedEditor, coreEditor]
  )

  const editorState = useEditorState({
    editor: mainEditor,
    selector(context) {
      if (!context.editor) {
        return {
          editor: null,
          editorState: undefined,
          canCommand: undefined,
        }
      }

      return {
        editor: context.editor,
        editorState: context.editor.state,
        canCommand: context.editor.can,
      }
    },
  })

  return editorState || { editor: null }
}
