loaded_plg_path=""
qqnt_path=""


mkdir tmp
cp ./src ./tmp/ -a
cp ./manifest.json ./tmp/
rm -rf ${loaded_plg_path}
mv ./tmp/ ${loaded_plg_path}
rm -rf ./tmp
"${qqnt_path}" --enable-logging