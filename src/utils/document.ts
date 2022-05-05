export type UUID = string & { _uuid: undefined };

export type Document<T extends Record<string, unknown>> = {
  id: UUID;
  createdAt: Date;
  updatedAt: Date;
} & T;

// insertで使う型を生成する
export type CreateArg<T extends Document<Record<string, unknown>>> = Omit<
  T,
  "id" | "createdAt" | "updatedAt" | "deletedAt"
>;

const generateUuid = (): UUID => {
  return crypto.randomUUID() as UUID;
};

export const createDocument = <T extends Record<string, unknown>>(
  d: T,
): Document<T> => {
  return {
    ...d,
    id: generateUuid(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

// FileDBとの相性を考えてカリー化
export const updateDocument = <T extends Record<string, unknown>>(
  patch: Partial<T>,
) =>
  (
    oldDoc: Document<T>,
  ): Document<T> => {
    return {
      ...oldDoc,
      ...patch,
      updatedAt: new Date(),
    };
  };
