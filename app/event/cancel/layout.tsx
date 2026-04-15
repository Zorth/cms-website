import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cancel Registration | Tarragon',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CancelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
