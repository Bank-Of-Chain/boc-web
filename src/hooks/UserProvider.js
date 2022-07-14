import { useMemo } from "react";
const useUserProvider = (injectedProvider, localProvider) =>
  useMemo(() => {
    if (injectedProvider) {
      console.log("🦊 Using injected provider");
      return injectedProvider;
    }
    if (localProvider) {
      console.log("🦊 Using local provider");
      return localProvider;
    }
  }, [injectedProvider, localProvider]);

export default useUserProvider;
