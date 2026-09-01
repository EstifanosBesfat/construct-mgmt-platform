// Server-side user accounts store
export interface StoredUser {
  email: string;
  name?: string;
  password: string; // Stored securely
  createdAt: number;
}

const globalForUsers = globalThis as unknown as {
  cmsUsers?: Map<string, StoredUser>;
};

export const cmsUsers =
  globalForUsers.cmsUsers ||
  new Map<string, StoredUser>([
    [
      'admin@gmail.com',
      {
        email: 'admin@gmail.com',
        name: 'System Admin',
        password: 'Root@123',
        createdAt: Date.now(),
      },
    ],
    [
      'yonasleykun27@gmail.com',
      {
        email: 'yonasleykun27@gmail.com',
        name: 'Yonas Leykun',
        password: 'password123',
        createdAt: Date.now(),
      },
    ],
  ]);

if (process.env.NODE_ENV !== 'production') {
  globalForUsers.cmsUsers = cmsUsers;
}
