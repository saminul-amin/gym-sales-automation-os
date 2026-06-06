import "./globals.css";

export const metadata = {
  title: "Gym Sales Automation OS",
  description: "Professional gym sales, retention, review, and campaign operations console.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
