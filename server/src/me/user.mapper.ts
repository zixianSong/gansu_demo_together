import { toNum } from '../common/utils/serialize';

export type UserRow = {
  userId: bigint;
  nickname: string | null;
  avatarUrl: string | null;
  phone: string | null;
  email: string | null;
  gender: number | null;
  birthday: Date | null;
  signature: string | null;
};

function maskPhone(phone: string | null) {
  if (!phone) return null;
  if (phone.length < 7) return phone;
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
}

function maskEmail(email: string | null) {
  if (!email) return null;
  const at = email.indexOf('@');
  if (at <= 0) return email;
  return `${email[0]}***${email.slice(at)}`;
}

function birthdayText(value: Date | null) {
  if (!value) return null;
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, '0');
  const d = String(value.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function toPublicUser(user: UserRow) {
  const userId = toNum(user.userId) as number;
  return {
    userId,
    nickname: user.nickname,
    avatarUrl: user.avatarUrl,
    phone: maskPhone(user.phone),
    email: maskEmail(user.email),
    gender: user.gender ?? 0,
    birthday: birthdayText(user.birthday),
    signature: user.signature,
    account: `wx_${userId}`,
    memberLevel: '普通会员',
  };
}
