import { House, Info, UsersRound } from "lucide-react"

export type MenuItem = {
  title: string
  url: string
  description?: string
  icon?: React.ReactNode
  items?: MenuItem[]
}

export const logo = {
  url: "/",
  alt: "logo",
  title: "Alumni Network",
}

export const menu: MenuItem[] = [
  { title: "Home", url: "/", icon: <House size={16} /> },
  { title: "Alumni", url: "/alumni", icon: <UsersRound size={16} /> },
  {
    title: "About",
    url: "/about",
    icon: <Info size={16} />,
  },
]

export const auth = {
  login: { title: "Login", url: "/login" },
  signup: { title: "Sign up", url: "/register" },
}
