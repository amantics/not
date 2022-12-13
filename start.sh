# if dist folder does not exist run build:all
if [ ! -d "dist" ]; then
  pnpm build:all
fi

# run the server
pnpm start