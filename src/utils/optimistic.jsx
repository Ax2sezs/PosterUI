export const optimistic = async ({
  optimistic,
  request,
  rollback,
  onError
}) => {
  optimistic();
  try {
    await request();
  } catch (e) {
    rollback();
    onError?.(e);
  }
};
