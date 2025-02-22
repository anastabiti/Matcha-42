export type Profile = {
    id: number;
    username: string;
    name: string;
    age: number;
    distance: string;
    pics: string[];
    preview: {
        interests: string[];
        bio: string;
    };
};

export type FilterOptions = {
    minAge: number;
    maxAge: number;
    minFame: number;
    maxFame: number;
    maxDistance: number;
    minCommonTags: number;
    sortBy: 'age' | 'fame' | 'common_tags' | 'distance';
    filterTags: string[];
};

export interface Neo4jDateTime {
    year: { low: number; high: number };
    month: { low: number; high: number };
    day: { low: number; high: number };
    hour: { low: number; high: number };
    minute: { low: number; high: number };
    second: { low: number; high: number };
    nanosecond: { low: number; high: number };
    timeZoneOffsetSeconds: { low: number; high: number };
  }
  