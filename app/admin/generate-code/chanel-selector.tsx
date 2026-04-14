"use client"

import { useState } from "react"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const items = [
  {
    label: "Email",
    value: "email",
    placeholder: "Enter email e.g. user@example.com",
    type: "email",
  },
  {
    label: "SMS",
    value: "sms",
    placeholder: "Enter phone e.g. +8801XXXXXXXXX",
    type: "tel",
  },
]

export function ChanelSelector() {
  const [channel, setChannel] = useState(items[0])

  return (
    <>
      <Select
        name="channel"
        defaultValue={channel.value}
        onValueChange={(value) => {
          const selected = items.find((item) => item.value === value)
          if (selected) setChannel(selected)
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          <SelectGroup>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Field>
        <Input
          id="recipient"
          type={channel.type}
          name="recipient"
          placeholder={channel.placeholder}
          required
        />
      </Field>
    </>
  )
}
