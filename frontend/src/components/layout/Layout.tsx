import type {
  ReactNode,
} from "react";

import Navbar from "./Navbar";


interface LayoutProps {
  children: ReactNode;
}


function Layout({
  children,
}: LayoutProps) {
  return (
    <div className="app-layout">

      <Navbar />

      <div className="layout-content">
        {children}
      </div>

    </div>
  );
}


export default Layout;