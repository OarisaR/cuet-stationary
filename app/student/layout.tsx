"use client";

import UserNavbar from "../../components/UserNavbar";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <UserNavbar />
      {children}
    </>
  );
}