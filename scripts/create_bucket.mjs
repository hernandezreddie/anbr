import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ifsjouhcndmcfqjfawta.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlmc2pvdWhjbmRtY2ZxamZhd3RhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDgyNjQzNSwiZXhwIjoyMTAwNDAyNDM1fQ.FyAsc2Tjc1z3rPa_QER1AmgIT-Pdmwnc09v2hSqL4xo'
);

async function run() {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  console.log('Existing buckets:', JSON.stringify(buckets), 'Error:', listError);

  // Check if 'logos' bucket exists
  const exists = buckets?.find(b => b.name === 'logos');
  if (exists) {
    console.log('Bucket "logos" already exists:', exists.id);
    return;
  }

  const { data, error } = await supabase.storage.createBucket('logos', {
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
  });
  console.log('Create bucket result:', JSON.stringify({ data, error }));
}
run().catch(console.error);
