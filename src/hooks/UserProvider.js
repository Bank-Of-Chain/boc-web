import { useMemo } from "react";

/*
  ~ What it does? ~

  Gets user provider

  ~ How can I use? ~

  const userProvider = useUserProvider(injectedProvider, localProvider);

  ~ Features ~

  - Specify the injected provider from Metamask
  - Specify the local provider
  - Usage examples:
    const address = useUserAddress(userProvider);
    const tx = Transactor(userProvider, gasPrice)
*/

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
