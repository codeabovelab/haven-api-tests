# Haven API Tests #

Please visit the main [Haven](https://github.com/codeabovelab/haven-platform) project and read the [Haven documentation](https://github.com/codeabovelab/haven-platform/blob/master/README.md) for the complete installation instruction and feature list.

## License

Copyright 2016-2017 Code Above Lab LLC

Licensed under the [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0)(the "License");
you may not use this file except in compliance with the License.

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

# Running Tests

To run the tests:

```sh
export API_HOST=http://172.31.0.3:8761/ 
java -jar "$PATH_TO_JSTEREST/jsterest.jar" -t ./ main
```

Note that some test can modify cluster data. 
