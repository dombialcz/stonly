export const lazy = <T>(factory: () => T): (() => T) => {
  let instance: T | undefined;

  return () => {
    instance ??= factory();
    return instance;
  };
};
