export function useOptimistic() {
  return async ({ optimistic, rollback, request }) => {
    optimistic();
    try {
      await request();
    } catch (err) {
      rollback();
      throw err;
    }
  };
}
