import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
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
