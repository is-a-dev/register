import os
import json
import requests
import concurrent.futures

repository_directory = os.getcwd()
domains_directory = os.path.join(repository_directory, "domains")

def has_url_field(file_path):
  with open(file_path, "r") as file:
    data = json.load(file)
    record = data.get("record")
    if record and "URL" in record:
      return record["URL"]
  return None

def is_url_reachable(url: str):
  try:
    response = requests.head(url, allow_redirects=True)
    return response.status_code // 100 in [1, 2, 3]  # Check if status code is in the 1xx or 2xx or 3xx range (success)
  except requests.exceptions.RequestException:
    return False

urls_data = {
  "valid": {},
  "invalid": {},
  "non-http": {}
}

def handle_url_validation(file_path):
  url: str = has_url_field(file_path)
  if url:
    if url.startswith("http://") or url.startswith("https://"):
        if is_url_reachable(url):
          urls_data["valid"][file_path] = url
          print(f"URL '{url}' in file '{file_path}' is reachable.")
        else:
          urls_data["invalid"][file_path] = url
          print(f"URL '{url}' in file '{file_path}' is not reachable.")
    else:
      urls_data["non-http"][file_path] = url
      print(f"URL '{url}' in file '{file_path}' is neither HTTP nor HTTPS.")

max_threads = 20

with concurrent.futures.ThreadPoolExecutor(max_workers=max_threads) as executor:
  file_paths = []

  for root, _, files in os.walk(domains_directory):
    for filename in files:
      file_paths.append(os.path.join(root, filename))

  for file_path in file_paths:
    future = executor.submit(handle_url_validation, file_path)

result_file_path = os.path.join(repository_directory, "url-validation-result.json")
with open(result_file_path, "w") as result_file:
    json.dump(urls_data, result_file, indent=4)

print(f"Results saved to {result_file_path}")
