#!/usr/bin/env bash

DIR="$( cd "$( dirname "$0" )" && pwd -P )"
file_path=${DIR}/../node_modules/react-native/scripts/react_native_pods.rb
# Check if the file exists
if [ ! -f "$file_path" ]; then
  echo "iOS Error: File '$file_path' not found."
  exit 1
fi

# Print the original file content
# echo "Original content of $file_path:"
# cat "$file_path"

sed -i -e 's/privacy_file_aggregation_enabled: true/privacy_file_aggregation_enabled: false/g' "$file_path"

# Check if the replacement was successful
if [ $? -eq 0 ]; then
  echo "Legacy iOS pods updates completed successfully."
else
  echo "iOS Error: Legacy pods updates failed."
fi

# Print the modified file content
# echo "Modified content of $file_path:"
# cat "$file_path"
