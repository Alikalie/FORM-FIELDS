export type DashboardIconName =
  | "home"
  | "download"
  | "cart"
  | "heart"
  | "user"
  | "grid"
  | "bolt"
  | "clock"
  | "shield"
  | "chevron";

export function DashboardIcon({ name }: { name: DashboardIconName }) {
  const paths: Record<DashboardIconName, string> = {
    home: "M3 10.5 12 3l9 7.5v9a1.5 1.5 0 0 1-1.5 1.5H15v-7H9v7H4.5A1.5 1.5 0 0 1 3 19.5z",
    download: "M12 3v12m-5-5 5 5 5-5M4 20h16",
    cart: "M3 4h2l2.2 11h10.9l2-8H6M9 19a1 1 0 1 0 0 .01M17 19a1 1 0 1 0 0 .01",
    heart: "M20.8 8.8c0 4.1-8.8 10-8.8 10s-8.8-5.9-8.8-10A4.6 4.6 0 0 1 12 6.4a4.6 4.6 0 0 1 8.8 2.4z",
    user: "M20 21a8 8 0 0 0-16 0M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
    bolt: "m13 2-9 12h7l-1 8 10-13h-7z",
    clock: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zM12 7v5l3 2",
    shield: "M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11zM9 12l2 2 4-4",
    chevron: "m9 18 6-6-6-6",
  };

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d={paths[name]} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
