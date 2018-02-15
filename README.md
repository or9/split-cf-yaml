# split-cf-yaml
Split consolidated Cloudfoundry deployment manifest.yml into separate yml files

## Usage  
`node_modules/.bin/split-cf-yml` Will interpret `manifest.yml` and build separate deployment `.yml` files for each app entry, merging their contents with shared properties. `manifest.yml` must have an `appliciations` entry for this to work.   

### Flags
`--fail=true` Will fail if writing a file encounters an error  