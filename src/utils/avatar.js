export function avatarUrlFor(user) {
  if (!user?.username) return "https://i.pravatar.cc/64?u=guest";
  return `https://i.pravatar.cc/64?u=${encodeURIComponent(user.username)}`;
}
