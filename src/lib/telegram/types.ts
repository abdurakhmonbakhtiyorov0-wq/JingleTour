/** Минимальные типы Telegram Bot API — только поля, которые использует сайт. */

export interface TgUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  username?: string;
}

export interface TgChat {
  id: number;
  type: "private" | "group" | "supergroup" | "channel";
  title?: string;
  username?: string;
}

export interface TgPhotoSize {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  file_size?: number;
}

export interface TgMediaWithThumbnail {
  file_id: string;
  file_unique_id: string;
  thumbnail?: TgPhotoSize;
}

export type TgMessageOrigin =
  | { type: "channel"; date: number; chat: TgChat; message_id: number }
  | { type: "user" | "hidden_user" | "chat"; date: number };

export interface TgMessage {
  message_id: number;
  date: number;
  chat: TgChat;
  from?: TgUser;
  text?: string;
  caption?: string;
  photo?: TgPhotoSize[];
  video?: TgMediaWithThumbnail;
  animation?: TgMediaWithThumbnail;
  document?: TgMediaWithThumbnail;
  media_group_id?: string;
  forward_origin?: TgMessageOrigin;
  edit_date?: number;
}

export interface TgCallbackQuery {
  id: string;
  from: TgUser;
  message?: TgMessage;
  data?: string;
}

export interface TgUpdate {
  update_id: number;
  message?: TgMessage;
  channel_post?: TgMessage;
  edited_channel_post?: TgMessage;
  callback_query?: TgCallbackQuery;
}

export interface TgInlineButton {
  text: string;
  callback_data?: string;
  url?: string;
}

export interface TgFile {
  file_id: string;
  file_unique_id: string;
  file_size?: number;
  file_path?: string;
}
