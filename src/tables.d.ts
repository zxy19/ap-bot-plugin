declare module 'koishi' {
  interface Tables {
    ap_uid_bind: ApUidBind
  }
}

export interface ApUidBind {
  id: number
  user: string
  uid: string
}
