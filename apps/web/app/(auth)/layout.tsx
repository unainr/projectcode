import { TypeLayout } from "@/types";

const Layout = ({ children }: TypeLayout) => {
  return (
    <div className="grid min-h-svh lg:grid-cols-1 dark:bg-[#212126] overflow-hidden ">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center ">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
