const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_KEY;

export const sbFetch = async (path, options = {}) => {
  const { headers: customHeaders, ...rest } = options;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...rest,
    headers: {
      apikey:         SUPABASE_ANON_KEY,
      Authorization:  `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer:         "return=representation",
      ...customHeaders,
    },
  });
  if (!res.ok) throw new Error(await res.text());
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};
