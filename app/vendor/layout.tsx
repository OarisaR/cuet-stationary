"use client";

import VendorNavbar from "@/components/VendorNavbar";

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <VendorNavbar />
      {children}
    </>
  );
}