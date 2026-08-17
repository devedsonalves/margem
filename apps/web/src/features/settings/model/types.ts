export type ProfileSettingsInput = {
  email: string
  name: string
}

export type PasswordSettingsInput = {
  currentPassword: string
  newPassword: string
}

export type SettingsFeedbackState = {
  message: string
  type: 'error' | 'success'
} | null
