module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        accessKeyId: env('S3_ACCESS_KEY_ID'),
        secretAccessKey: env('S3_ACCESS_SECRET'),
        region: env('S3_REGION', 'auto'),
        params: {
          Bucket: env('S3_BUCKET'),
        },
        // Para Cloudflare R2 (S3-compatible)
        endpoint: env('S3_ENDPOINT'),
        s3ForcePathStyle: true,
      },
    },
  },
});
