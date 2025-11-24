const cookie = {
  SIDEBAR: (prefix: string) => `${prefix}_sidebar`,
  DEVICE: (prefix: string) => `${prefix}_device`,
  AUTH_TOKEN: (prefix: string) => `${prefix}_auth_token`,
  PAGE_SIZE: (prefix: string) => `${prefix}_page_size`,
}

export default cookie
