/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

export const apmFieldMappings = {
  '@timestamp': {
    type: 'date',
  },
  agent: {
    dynamic: 'false',
    properties: {
      ephemeral_id: {
        type: 'keyword',
        ignore_above: 1024,
      },
      hostname: {
        type: 'keyword',
        ignore_above: 1024,
      },
      id: {
        type: 'keyword',
        ignore_above: 1024,
      },
      name: {
        type: 'keyword',
        ignore_above: 1024,
      },
      type: {
        type: 'keyword',
        ignore_above: 1024,
      },
      version: {
        type: 'keyword',
        ignore_above: 1024,
      },
    },
  },
  as: {
    properties: {
      number: {
        type: 'long',
      },
      organization: {
        properties: {
          name: {
            type: 'keyword',
            fields: {
              text: {
                type: 'text',
                norms: false,
              },
            },
            ignore_above: 1024,
          },
        },
      },
    },
  },
  client: {
    dynamic: 'false',
    properties: {
      address: {
        type: 'keyword',
        ignore_above: 1024,
      },
      as: {
        properties: {
          number: {
            type: 'long',
          },
          organization: {
            properties: {
              name: {
                type: 'keyword',
                fields: {
                  text: {
                    type: 'text',
                    norms: false,
                  },
                },
                ignore_above: 1024,
              },
            },
          },
        },
      },
      bytes: {
        type: 'long',
      },
      domain: {
        type: 'keyword',
        ignore_above: 1024,
      },
      geo: {
        properties: {
          city_name: {
            type: 'keyword',
            ignore_above: 1024,
          },
          continent_name: {
            type: 'keyword',
            ignore_above: 1024,
          },
          country_iso_code: {
            type: 'keyword',
            ignore_above: 1024,
          },
          country_name: {
            type: 'keyword',
            ignore_above: 1024,
          },
          location: {
            type: 'geo_point',
          },
          name: {
            type: 'keyword',
            ignore_above: 1024,
          },
          region_iso_code: {
            type: 'keyword',
            ignore_above: 1024,
          },
          region_name: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
      ip: {
        type: 'ip',
      },
      mac: {
        type: 'keyword',
        ignore_above: 1024,
      },
      nat: {
        properties: {
          ip: {
            type: 'ip',
          },
          port: {
            type: 'long',
          },
        },
      },
      packets: {
        type: 'long',
      },
      port: {
        type: 'long',
      },
      registered_domain: {
        type: 'keyword',
        ignore_above: 1024,
      },
      top_level_domain: {
        type: 'keyword',
        ignore_above: 1024,
      },
      user: {
        properties: {
          domain: {
            type: 'keyword',
            ignore_above: 1024,
          },
          email: {
            type: 'keyword',
            ignore_above: 1024,
          },
          full_name: {
            type: 'keyword',
            fields: {
              text: {
                type: 'text',
                norms: false,
              },
            },
            ignore_above: 1024,
          },
          group: {
            properties: {
              domain: {
                type: 'keyword',
                ignore_above: 1024,
              },
              id: {
                type: 'keyword',
                ignore_above: 1024,
              },
              name: {
                type: 'keyword',
                ignore_above: 1024,
              },
            },
          },
          hash: {
            type: 'keyword',
            ignore_above: 1024,
          },
          id: {
            type: 'keyword',
            ignore_above: 1024,
          },
          name: {
            type: 'keyword',
            fields: {
              text: {
                type: 'text',
                norms: false,
              },
            },
            ignore_above: 1024,
          },
        },
      },
    },
  },
  cloud: {
    properties: {
      account: {
        properties: {
          id: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
      availability_zone: {
        type: 'keyword',
        ignore_above: 1024,
      },
      image: {
        properties: {
          id: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
      instance: {
        properties: {
          id: {
            type: 'keyword',
            ignore_above: 1024,
          },
          name: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
      machine: {
        properties: {
          type: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
      project: {
        properties: {
          id: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
      provider: {
        type: 'keyword',
        ignore_above: 1024,
      },
      region: {
        type: 'keyword',
        ignore_above: 1024,
      },
    },
  },
  container: {
    dynamic: 'false',
    properties: {
      id: {
        type: 'keyword',
        ignore_above: 1024,
      },
      image: {
        properties: {
          name: {
            type: 'keyword',
            ignore_above: 1024,
          },
          tag: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
      labels: {
        type: 'object',
      },
      name: {
        type: 'keyword',
        ignore_above: 1024,
      },
      runtime: {
        type: 'keyword',
        ignore_above: 1024,
      },
    },
  },
  destination: {
    properties: {
      address: {
        type: 'keyword',
        ignore_above: 1024,
      },
      as: {
        properties: {
          number: {
            type: 'long',
          },
          organization: {
            properties: {
              name: {
                type: 'keyword',
                fields: {
                  text: {
                    type: 'text',
                    norms: false,
                  },
                },
                ignore_above: 1024,
              },
            },
          },
        },
      },
      bytes: {
        type: 'long',
      },
      domain: {
        type: 'keyword',
        ignore_above: 1024,
      },
      geo: {
        properties: {
          city_name: {
            type: 'keyword',
            ignore_above: 1024,
          },
          continent_name: {
            type: 'keyword',
            ignore_above: 1024,
          },
          country_iso_code: {
            type: 'keyword',
            ignore_above: 1024,
          },
          country_name: {
            type: 'keyword',
            ignore_above: 1024,
          },
          location: {
            type: 'geo_point',
          },
          name: {
            type: 'keyword',
            ignore_above: 1024,
          },
          region_iso_code: {
            type: 'keyword',
            ignore_above: 1024,
          },
          region_name: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
      ip: {
        type: 'ip',
      },
      mac: {
        type: 'keyword',
        ignore_above: 1024,
      },
      nat: {
        properties: {
          ip: {
            type: 'ip',
          },
          port: {
            type: 'long',
          },
        },
      },
      packets: {
        type: 'long',
      },
      port: {
        type: 'long',
      },
      registered_domain: {
        type: 'keyword',
        ignore_above: 1024,
      },
      top_level_domain: {
        type: 'keyword',
        ignore_above: 1024,
      },
      user: {
        properties: {
          domain: {
            type: 'keyword',
            ignore_above: 1024,
          },
          email: {
            type: 'keyword',
            ignore_above: 1024,
          },
          full_name: {
            type: 'keyword',
            fields: {
              text: {
                type: 'text',
                norms: false,
              },
            },
            ignore_above: 1024,
          },
          group: {
            properties: {
              domain: {
                type: 'keyword',
                ignore_above: 1024,
              },
              id: {
                type: 'keyword',
                ignore_above: 1024,
              },
              name: {
                type: 'keyword',
                ignore_above: 1024,
              },
            },
          },
          hash: {
            type: 'keyword',
            ignore_above: 1024,
          },
          id: {
            type: 'keyword',
            ignore_above: 1024,
          },
          name: {
            type: 'keyword',
            fields: {
              text: {
                type: 'text',
                norms: false,
              },
            },
            ignore_above: 1024,
          },
        },
      },
    },
  },
  dns: {
    properties: {
      answers: {
        properties: {
          class: {
            type: 'keyword',
            ignore_above: 1024,
          },
          data: {
            type: 'keyword',
            ignore_above: 1024,
          },
          name: {
            type: 'keyword',
            ignore_above: 1024,
          },
          ttl: {
            type: 'long',
          },
          type: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
      header_flags: {
        type: 'keyword',
        ignore_above: 1024,
      },
      id: {
        type: 'keyword',
        ignore_above: 1024,
      },
      op_code: {
        type: 'keyword',
        ignore_above: 1024,
      },
      question: {
        properties: {
          class: {
            type: 'keyword',
            ignore_above: 1024,
          },
          name: {
            type: 'keyword',
            ignore_above: 1024,
          },
          registered_domain: {
            type: 'keyword',
            ignore_above: 1024,
          },
          subdomain: {
            type: 'keyword',
            ignore_above: 1024,
          },
          top_level_domain: {
            type: 'keyword',
            ignore_above: 1024,
          },
          type: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
      resolved_ip: {
        type: 'ip',
      },
      response_code: {
        type: 'keyword',
        ignore_above: 1024,
      },
      type: {
        type: 'keyword',
        ignore_above: 1024,
      },
    },
  },
  docker: {
    properties: {
      container: {
        properties: {
          labels: {
            type: 'object',
          },
        },
      },
    },
  },
  ecs: {
    properties: {
      version: {
        type: 'keyword',
        ignore_above: 1024,
      },
    },
  },
  error: {
    dynamic: 'false',
    properties: {
      code: {
        type: 'keyword',
        ignore_above: 1024,
      },
      culprit: {
        type: 'keyword',
        ignore_above: 1024,
      },
      exception: {
        properties: {
          code: {
            type: 'keyword',
            ignore_above: 1024,
          },
          handled: {
            type: 'boolean',
          },
          message: {
            type: 'text',
            norms: false,
          },
          module: {
            type: 'keyword',
            ignore_above: 1024,
          },
          type: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
      grouping_key: {
        type: 'keyword',
        ignore_above: 1024,
      },
      id: {
        type: 'keyword',
        ignore_above: 1024,
      },
      log: {
        properties: {
          level: {
            type: 'keyword',
            ignore_above: 1024,
          },
          logger_name: {
            type: 'keyword',
            ignore_above: 1024,
          },
          message: {
            type: 'text',
            norms: false,
          },
          param_message: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
      message: {
        type: 'text',
        norms: false,
      },
      stack_trace: {
        type: 'keyword',
        fields: {
          text: {
            type: 'text',
            norms: false,
          },
        },
        ignore_above: 1024,
      },
      type: {
        type: 'keyword',
        ignore_above: 1024,
      },
    },
  },
  event: {
    properties: {
      action: {
        type: 'keyword',
        ignore_above: 1024,
      },
      category: {
        type: 'keyword',
        ignore_above: 1024,
      },
      code: {
        type: 'keyword',
        ignore_above: 1024,
      },
      created: {
        type: 'date',
      },
      dataset: {
        type: 'keyword',
        ignore_above: 1024,
      },
      duration: {
        type: 'long',
      },
      end: {
        type: 'date',
      },
      hash: {
        type: 'keyword',
        ignore_above: 1024,
      },
      id: {
        type: 'keyword',
        ignore_above: 1024,
      },
      ingested: {
        type: 'date',
      },
      kind: {
        type: 'keyword',
        ignore_above: 1024,
      },
      module: {
        type: 'keyword',
        ignore_above: 1024,
      },
      original: {
        type: 'keyword',
        ignore_above: 1024,
      },
      outcome: {
        type: 'keyword',
        ignore_above: 1024,
      },
      provider: {
        type: 'keyword',
        ignore_above: 1024,
      },
      risk_score: {
        type: 'float',
      },
      risk_score_norm: {
        type: 'float',
      },
      sequence: {
        type: 'long',
      },
      severity: {
        type: 'long',
      },
      start: {
        type: 'date',
      },
      timezone: {
        type: 'keyword',
        ignore_above: 1024,
      },
      type: {
        type: 'keyword',
        ignore_above: 1024,
      },
    },
  },
  experimental: {
    type: 'object',
    dynamic: 'true',
  },
  fields: {
    type: 'object',
  },
  file: {
    properties: {
      accessed: {
        type: 'date',
      },
      attributes: {
        type: 'keyword',
        ignore_above: 1024,
      },
      created: {
        type: 'date',
      },
      ctime: {
        type: 'date',
      },
      device: {
        type: 'keyword',
        ignore_above: 1024,
      },
      directory: {
        type: 'keyword',
        ignore_above: 1024,
      },
      drive_letter: {
        type: 'keyword',
        ignore_above: 1,
      },
      extension: {
        type: 'keyword',
        ignore_above: 1024,
      },
      gid: {
        type: 'keyword',
        ignore_above: 1024,
      },
      group: {
        type: 'keyword',
        ignore_above: 1024,
      },
      hash: {
        properties: {
          md5: {
            type: 'keyword',
            ignore_above: 1024,
          },
          sha1: {
            type: 'keyword',
            ignore_above: 1024,
          },
          sha256: {
            type: 'keyword',
            ignore_above: 1024,
          },
          sha512: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
      inode: {
        type: 'keyword',
        ignore_above: 1024,
      },
      mode: {
        type: 'keyword',
        ignore_above: 1024,
      },
      mtime: {
        type: 'date',
      },
      name: {
        type: 'keyword',
        ignore_above: 1024,
      },
      owner: {
        type: 'keyword',
        ignore_above: 1024,
      },
      path: {
        type: 'keyword',
        fields: {
          text: {
            type: 'text',
            norms: false,
          },
        },
        ignore_above: 1024,
      },
      size: {
        type: 'long',
      },
      target_path: {
        type: 'keyword',
        fields: {
          text: {
            type: 'text',
            norms: false,
          },
        },
        ignore_above: 1024,
      },
      type: {
        type: 'keyword',
        ignore_above: 1024,
      },
      uid: {
        type: 'keyword',
        ignore_above: 1024,
      },
    },
  },
  geo: {
    properties: {
      city_name: {
        type: 'keyword',
        ignore_above: 1024,
      },
      continent_name: {
        type: 'keyword',
        ignore_above: 1024,
      },
      country_iso_code: {
        type: 'keyword',
        ignore_above: 1024,
      },
      country_name: {
        type: 'keyword',
        ignore_above: 1024,
      },
      location: {
        type: 'geo_point',
      },
      name: {
        type: 'keyword',
        ignore_above: 1024,
      },
      region_iso_code: {
        type: 'keyword',
        ignore_above: 1024,
      },
      region_name: {
        type: 'keyword',
        ignore_above: 1024,
      },
    },
  },
  group: {
    properties: {
      domain: {
        type: 'keyword',
        ignore_above: 1024,
      },
      id: {
        type: 'keyword',
        ignore_above: 1024,
      },
      name: {
        type: 'keyword',
        ignore_above: 1024,
      },
    },
  },
  hash: {
    properties: {
      md5: {
        type: 'keyword',
        ignore_above: 1024,
      },
      sha1: {
        type: 'keyword',
        ignore_above: 1024,
      },
      sha256: {
        type: 'keyword',
        ignore_above: 1024,
      },
      sha512: {
        type: 'keyword',
        ignore_above: 1024,
      },
    },
  },
  host: {
    dynamic: 'false',
    properties: {
      architecture: {
        type: 'keyword',
        ignore_above: 1024,
      },
      containerized: {
        type: 'boolean',
      },
      domain: {
        type: 'keyword',
        ignore_above: 1024,
      },
      geo: {
        properties: {
          city_name: {
            type: 'keyword',
            ignore_above: 1024,
          },
          continent_name: {
            type: 'keyword',
            ignore_above: 1024,
          },
          country_iso_code: {
            type: 'keyword',
            ignore_above: 1024,
          },
          country_name: {
            type: 'keyword',
            ignore_above: 1024,
          },
          location: {
            type: 'geo_point',
          },
          name: {
            type: 'keyword',
            ignore_above: 1024,
          },
          region_iso_code: {
            type: 'keyword',
            ignore_above: 1024,
          },
          region_name: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
      hostname: {
        type: 'keyword',
        ignore_above: 1024,
      },
      id: {
        type: 'keyword',
        ignore_above: 1024,
      },
      ip: {
        type: 'ip',
      },
      mac: {
        type: 'keyword',
        ignore_above: 1024,
      },
      name: {
        type: 'keyword',
        ignore_above: 1024,
      },
      os: {
        properties: {
          build: {
            type: 'keyword',
            ignore_above: 1024,
          },
          codename: {
            type: 'keyword',
            ignore_above: 1024,
          },
          family: {
            type: 'keyword',
            ignore_above: 1024,
          },
          full: {
            type: 'keyword',
            fields: {
              text: {
                type: 'text',
                norms: false,
              },
            },
            ignore_above: 1024,
          },
          kernel: {
            type: 'keyword',
            ignore_above: 1024,
          },
          name: {
            type: 'keyword',
            fields: {
              text: {
                type: 'text',
                norms: false,
              },
            },
            ignore_above: 1024,
          },
          platform: {
            type: 'keyword',
            ignore_above: 1024,
          },
          version: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
      type: {
        type: 'keyword',
        ignore_above: 1024,
      },
      uptime: {
        type: 'long',
      },
      user: {
        properties: {
          domain: {
            type: 'keyword',
            ignore_above: 1024,
          },
          email: {
            type: 'keyword',
            ignore_above: 1024,
          },
          full_name: {
            type: 'keyword',
            fields: {
              text: {
                type: 'text',
                norms: false,
              },
            },
            ignore_above: 1024,
          },
          group: {
            properties: {
              domain: {
                type: 'keyword',
                ignore_above: 1024,
              },
              id: {
                type: 'keyword',
                ignore_above: 1024,
              },
              name: {
                type: 'keyword',
                ignore_above: 1024,
              },
            },
          },
          hash: {
            type: 'keyword',
            ignore_above: 1024,
          },
          id: {
            type: 'keyword',
            ignore_above: 1024,
          },
          name: {
            type: 'keyword',
            fields: {
              text: {
                type: 'text',
                norms: false,
              },
            },
            ignore_above: 1024,
          },
        },
      },
    },
  },
  http: {
    dynamic: 'false',
    properties: {
      request: {
        properties: {
          body: {
            properties: {
              bytes: {
                type: 'long',
              },
              content: {
                type: 'keyword',
                fields: {
                  text: {
                    type: 'text',
                    norms: false,
                  },
                },
                ignore_above: 1024,
              },
            },
          },
          bytes: {
            type: 'long',
          },
          headers: {
            type: 'object',
            enabled: false,
          },
          method: {
            type: 'keyword',
            ignore_above: 1024,
          },
          referrer: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
      response: {
        properties: {
          body: {
            properties: {
              bytes: {
                type: 'long',
              },
              content: {
                type: 'keyword',
                fields: {
                  text: {
                    type: 'text',
                    norms: false,
                  },
                },
                ignore_above: 1024,
              },
            },
          },
          bytes: {
            type: 'long',
          },
          finished: {
            type: 'boolean',
          },
          headers: {
            type: 'object',
            enabled: false,
          },
          status_code: {
            type: 'long',
          },
        },
      },
      version: {
        type: 'keyword',
        ignore_above: 1024,
      },
    },
  },
  kubernetes: {
    dynamic: 'false',
    properties: {
      annotations: {
        properties: {
          '*': {
            type: 'object',
          },
        },
      },
      container: {
        properties: {
          image: {
            type: 'keyword',
            ignore_above: 1024,
          },
          name: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
      deployment: {
        properties: {
          name: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
      labels: {
        properties: {
          '*': {
            type: 'object',
          },
        },
      },
      namespace: {
        type: 'keyword',
        ignore_above: 1024,
      },
      node: {
        properties: {
          name: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
      pod: {
        properties: {
          name: {
            type: 'keyword',
            ignore_above: 1024,
          },
          uid: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
      replicaset: {
        properties: {
          name: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
      statefulset: {
        properties: {
          name: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
    },
  },
  labels: {
    dynamic: 'true',
    properties: {
      company: {
        type: 'keyword',
      },
      customer_email: {
        type: 'keyword',
      },
      customer_name: {
        type: 'keyword',
      },
      customer_tier: {
        type: 'keyword',
      },
      foo: {
        type: 'keyword',
      },
      lorem: {
        type: 'keyword',
      },
      'multi-line': {
        type: 'keyword',
      },
      request_id: {
        type: 'keyword',
      },
      served_from_cache: {
        type: 'keyword',
      },
      'this-is-a-very-long-tag-name-without-any-spaces': {
        type: 'keyword',
      },
    },
  },
  log: {
    properties: {
      level: {
        type: 'keyword',
        ignore_above: 1024,
      },
      logger: {
        type: 'keyword',
        ignore_above: 1024,
      },
      origin: {
        properties: {
          file: {
            properties: {
              line: {
                type: 'long',
              },
              name: {
                type: 'keyword',
                ignore_above: 1024,
              },
            },
          },
          function: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
      original: {
        type: 'keyword',
        ignore_above: 1024,
      },
      syslog: {
        properties: {
          facility: {
            properties: {
              code: {
                type: 'long',
              },
              name: {
                type: 'keyword',
                ignore_above: 1024,
              },
            },
          },
          priority: {
            type: 'long',
          },
          severity: {
            properties: {
              code: {
                type: 'long',
              },
              name: {
                type: 'keyword',
                ignore_above: 1024,
              },
            },
          },
        },
      },
    },
  },
  message: {
    type: 'text',
    norms: false,
  },
  network: {
    properties: {
      application: {
        type: 'keyword',
        ignore_above: 1024,
      },
      bytes: {
        type: 'long',
      },
      community_id: {
        type: 'keyword',
        ignore_above: 1024,
      },
      direction: {
        type: 'keyword',
        ignore_above: 1024,
      },
      forwarded_ip: {
        type: 'ip',
      },
      iana_number: {
        type: 'keyword',
        ignore_above: 1024,
      },
      name: {
        type: 'keyword',
        ignore_above: 1024,
      },
      packets: {
        type: 'long',
      },
      protocol: {
        type: 'keyword',
        ignore_above: 1024,
      },
      transport: {
        type: 'keyword',
        ignore_above: 1024,
      },
      type: {
        type: 'keyword',
        ignore_above: 1024,
      },
    },
  },
  observer: {
    dynamic: 'false',
    properties: {
      geo: {
        properties: {
          city_name: {
            type: 'keyword',
            ignore_above: 1024,
          },
          continent_name: {
            type: 'keyword',
            ignore_above: 1024,
          },
          country_iso_code: {
            type: 'keyword',
            ignore_above: 1024,
          },
          country_name: {
            type: 'keyword',
            ignore_above: 1024,
          },
          location: {
            type: 'geo_point',
          },
          name: {
            type: 'keyword',
            ignore_above: 1024,
          },
          region_iso_code: {
            type: 'keyword',
            ignore_above: 1024,
          },
          region_name: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
      hostname: {
        type: 'keyword',
        ignore_above: 1024,
      },
      ip: {
        type: 'ip',
      },
      listening: {
        type: 'keyword',
        ignore_above: 1024,
      },
      mac: {
        type: 'keyword',
        ignore_above: 1024,
      },
      name: {
        type: 'keyword',
        ignore_above: 1024,
      },
      os: {
        properties: {
          family: {
            type: 'keyword',
            ignore_above: 1024,
          },
          full: {
            type: 'keyword',
            fields: {
              text: {
                type: 'text',
                norms: false,
              },
            },
            ignore_above: 1024,
          },
          kernel: {
            type: 'keyword',
            ignore_above: 1024,
          },
          name: {
            type: 'keyword',
            fields: {
              text: {
                type: 'text',
                norms: false,
              },
            },
            ignore_above: 1024,
          },
          platform: {
            type: 'keyword',
            ignore_above: 1024,
          },
          version: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
      product: {
        type: 'keyword',
        ignore_above: 1024,
      },
      serial_number: {
        type: 'keyword',
        ignore_above: 1024,
      },
      type: {
        type: 'keyword',
        ignore_above: 1024,
      },
      vendor: {
        type: 'keyword',
        ignore_above: 1024,
      },
      version: {
        type: 'keyword',
        ignore_above: 1024,
      },
      version_major: {
        type: 'byte',
      },
    },
  },
  organization: {
    properties: {
      id: {
        type: 'keyword',
        ignore_above: 1024,
      },
      name: {
        type: 'keyword',
        fields: {
          text: {
            type: 'text',
            norms: false,
          },
        },
        ignore_above: 1024,
      },
    },
  },
  os: {
    properties: {
      family: {
        type: 'keyword',
        ignore_above: 1024,
      },
      full: {
        type: 'keyword',
        fields: {
          text: {
            type: 'text',
            norms: false,
          },
        },
        ignore_above: 1024,
      },
      kernel: {
        type: 'keyword',
        ignore_above: 1024,
      },
      name: {
        type: 'keyword',
        fields: {
          text: {
            type: 'text',
            norms: false,
          },
        },
        ignore_above: 1024,
      },
      platform: {
        type: 'keyword',
        ignore_above: 1024,
      },
      version: {
        type: 'keyword',
        ignore_above: 1024,
      },
    },
  },
  package: {
    properties: {
      architecture: {
        type: 'keyword',
        ignore_above: 1024,
      },
      build_version: {
        type: 'keyword',
        ignore_above: 1024,
      },
      checksum: {
        type: 'keyword',
        ignore_above: 1024,
      },
      description: {
        type: 'keyword',
        ignore_above: 1024,
      },
      install_scope: {
        type: 'keyword',
        ignore_above: 1024,
      },
      installed: {
        type: 'date',
      },
      license: {
        type: 'keyword',
        ignore_above: 1024,
      },
      name: {
        type: 'keyword',
        ignore_above: 1024,
      },
      path: {
        type: 'keyword',
        ignore_above: 1024,
      },
      reference: {
        type: 'keyword',
        ignore_above: 1024,
      },
      size: {
        type: 'long',
      },
      type: {
        type: 'keyword',
        ignore_above: 1024,
      },
      version: {
        type: 'keyword',
        ignore_above: 1024,
      },
    },
  },
  parent: {
    dynamic: 'false',
    properties: {
      id: {
        type: 'keyword',
        ignore_above: 1024,
      },
    },
  },
  process: {
    dynamic: 'false',
    properties: {
      args: {
        type: 'keyword',
        ignore_above: 1024,
      },
      args_count: {
        type: 'long',
      },
      command_line: {
        type: 'keyword',
        fields: {
          text: {
            type: 'text',
            norms: false,
          },
        },
        ignore_above: 1024,
      },
      executable: {
        type: 'keyword',
        fields: {
          text: {
            type: 'text',
            norms: false,
          },
        },
        ignore_above: 1024,
      },
      exit_code: {
        type: 'long',
      },
      hash: {
        properties: {
          md5: {
            type: 'keyword',
            ignore_above: 1024,
          },
          sha1: {
            type: 'keyword',
            ignore_above: 1024,
          },
          sha256: {
            type: 'keyword',
            ignore_above: 1024,
          },
          sha512: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
      name: {
        type: 'keyword',
        fields: {
          text: {
            type: 'text',
            norms: false,
          },
        },
        ignore_above: 1024,
      },
      parent: {
        properties: {
          args: {
            type: 'keyword',
            ignore_above: 1024,
          },
          args_count: {
            type: 'long',
          },
          command_line: {
            type: 'keyword',
            fields: {
              text: {
                type: 'text',
                norms: false,
              },
            },
            ignore_above: 1024,
          },
          executable: {
            type: 'keyword',
            fields: {
              text: {
                type: 'text',
                norms: false,
              },
            },
            ignore_above: 1024,
          },
          exit_code: {
            type: 'long',
          },
          name: {
            type: 'keyword',
            fields: {
              text: {
                type: 'text',
                norms: false,
              },
            },
            ignore_above: 1024,
          },
          pgid: {
            type: 'long',
          },
          pid: {
            type: 'long',
          },
          ppid: {
            type: 'long',
          },
          start: {
            type: 'date',
          },
          thread: {
            properties: {
              id: {
                type: 'long',
              },
              name: {
                type: 'keyword',
                ignore_above: 1024,
              },
            },
          },
          title: {
            type: 'keyword',
            fields: {
              text: {
                type: 'text',
                norms: false,
              },
            },
            ignore_above: 1024,
          },
          uptime: {
            type: 'long',
          },
          working_directory: {
            type: 'keyword',
            fields: {
              text: {
                type: 'text',
                norms: false,
              },
            },
            ignore_above: 1024,
          },
        },
      },
      pgid: {
        type: 'long',
      },
      pid: {
        type: 'long',
      },
      ppid: {
        type: 'long',
      },
      start: {
        type: 'date',
      },
      thread: {
        properties: {
          id: {
            type: 'long',
          },
          name: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
      title: {
        type: 'keyword',
        ignore_above: 1024,
      },
      uptime: {
        type: 'long',
      },
      working_directory: {
        type: 'keyword',
        fields: {
          text: {
            type: 'text',
            norms: false,
          },
        },
        ignore_above: 1024,
      },
    },
  },
  processor: {
    properties: {
      event: {
        type: 'keyword',
        ignore_above: 1024,
      },
      name: {
        type: 'keyword',
        ignore_above: 1024,
      },
    },
  },
  profile: {
    dynamic: 'false',
    properties: {
      alloc_objects: {
        properties: {
          count: {
            type: 'long',
          },
        },
      },
      alloc_space: {
        properties: {
          bytes: {
            type: 'long',
          },
        },
      },
      cpu: {
        properties: {
          ns: {
            type: 'long',
          },
        },
      },
      duration: {
        type: 'long',
      },
      inuse_objects: {
        properties: {
          count: {
            type: 'long',
          },
        },
      },
      inuse_space: {
        properties: {
          bytes: {
            type: 'long',
          },
        },
      },
      samples: {
        properties: {
          count: {
            type: 'long',
          },
        },
      },
      stack: {
        dynamic: 'false',
        properties: {
          filename: {
            type: 'keyword',
            ignore_above: 1024,
          },
          function: {
            type: 'keyword',
            ignore_above: 1024,
          },
          id: {
            type: 'keyword',
            ignore_above: 1024,
          },
          line: {
            type: 'long',
          },
        },
      },
      top: {
        dynamic: 'false',
        properties: {
          filename: {
            type: 'keyword',
            ignore_above: 1024,
          },
          function: {
            type: 'keyword',
            ignore_above: 1024,
          },
          id: {
            type: 'keyword',
            ignore_above: 1024,
          },
          line: {
            type: 'long',
          },
        },
      },
    },
  },
  registry: {
    properties: {
      data: {
        properties: {
          bytes: {
            type: 'keyword',
            ignore_above: 1024,
          },
          strings: {
            type: 'keyword',
            ignore_above: 1024,
          },
          type: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
      hive: {
        type: 'keyword',
        ignore_above: 1024,
      },
      key: {
        type: 'keyword',
        ignore_above: 1024,
      },
      path: {
        type: 'keyword',
        ignore_above: 1024,
      },
      value: {
        type: 'keyword',
        ignore_above: 1024,
      },
    },
  },
  related: {
    properties: {
      ip: {
        type: 'ip',
      },
      user: {
        type: 'keyword',
        ignore_above: 1024,
      },
    },
  },
  rule: {
    properties: {
      category: {
        type: 'keyword',
        ignore_above: 1024,
      },
      description: {
        type: 'keyword',
        ignore_above: 1024,
      },
      id: {
        type: 'keyword',
        ignore_above: 1024,
      },
      name: {
        type: 'keyword',
        ignore_above: 1024,
      },
      reference: {
        type: 'keyword',
        ignore_above: 1024,
      },
      ruleset: {
        type: 'keyword',
        ignore_above: 1024,
      },
      uuid: {
        type: 'keyword',
        ignore_above: 1024,
      },
      version: {
        type: 'keyword',
        ignore_above: 1024,
      },
    },
  },
  server: {
    properties: {
      address: {
        type: 'keyword',
        ignore_above: 1024,
      },
      as: {
        properties: {
          number: {
            type: 'long',
          },
          organization: {
            properties: {
              name: {
                type: 'keyword',
                fields: {
                  text: {
                    type: 'text',
                    norms: false,
                  },
                },
                ignore_above: 1024,
              },
            },
          },
        },
      },
      bytes: {
        type: 'long',
      },
      domain: {
        type: 'keyword',
        ignore_above: 1024,
      },
      geo: {
        properties: {
          city_name: {
            type: 'keyword',
            ignore_above: 1024,
          },
          continent_name: {
            type: 'keyword',
            ignore_above: 1024,
          },
          country_iso_code: {
            type: 'keyword',
            ignore_above: 1024,
          },
          country_name: {
            type: 'keyword',
            ignore_above: 1024,
          },
          location: {
            type: 'geo_point',
          },
          name: {
            type: 'keyword',
            ignore_above: 1024,
          },
          region_iso_code: {
            type: 'keyword',
            ignore_above: 1024,
          },
          region_name: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
      ip: {
        type: 'ip',
      },
      mac: {
        type: 'keyword',
        ignore_above: 1024,
      },
      nat: {
        properties: {
          ip: {
            type: 'ip',
          },
          port: {
            type: 'long',
          },
        },
      },
      packets: {
        type: 'long',
      },
      port: {
        type: 'long',
      },
      registered_domain: {
        type: 'keyword',
        ignore_above: 1024,
      },
      top_level_domain: {
        type: 'keyword',
        ignore_above: 1024,
      },
      user: {
        properties: {
          domain: {
            type: 'keyword',
            ignore_above: 1024,
          },
          email: {
            type: 'keyword',
            ignore_above: 1024,
          },
          full_name: {
            type: 'keyword',
            fields: {
              text: {
                type: 'text',
                norms: false,
              },
            },
            ignore_above: 1024,
          },
          group: {
            properties: {
              domain: {
                type: 'keyword',
                ignore_above: 1024,
              },
              id: {
                type: 'keyword',
                ignore_above: 1024,
              },
              name: {
                type: 'keyword',
                ignore_above: 1024,
              },
            },
          },
          hash: {
            type: 'keyword',
            ignore_above: 1024,
          },
          id: {
            type: 'keyword',
            ignore_above: 1024,
          },
          name: {
            type: 'keyword',
            fields: {
              text: {
                type: 'text',
                norms: false,
              },
            },
            ignore_above: 1024,
          },
        },
      },
    },
  },
  service: {
    dynamic: 'false',
    properties: {
      environment: {
        type: 'keyword',
        ignore_above: 1024,
      },
      ephemeral_id: {
        type: 'keyword',
        ignore_above: 1024,
      },
      framework: {
        properties: {
          name: {
            type: 'keyword',
            ignore_above: 1024,
          },
          version: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
      id: {
        type: 'keyword',
        ignore_above: 1024,
      },
      language: {
        properties: {
          name: {
            type: 'keyword',
            ignore_above: 1024,
          },
          version: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
      name: {
        type: 'keyword',
        ignore_above: 1024,
      },
      node: {
        properties: {
          name: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
      runtime: {
        properties: {
          name: {
            type: 'keyword',
            ignore_above: 1024,
          },
          version: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
      state: {
        type: 'keyword',
        ignore_above: 1024,
      },
      type: {
        type: 'keyword',
        ignore_above: 1024,
      },
      version: {
        type: 'keyword',
        ignore_above: 1024,
      },
    },
  },
  source: {
    dynamic: 'false',
    properties: {
      address: {
        type: 'keyword',
        ignore_above: 1024,
      },
      as: {
        properties: {
          number: {
            type: 'long',
          },
          organization: {
            properties: {
              name: {
                type: 'keyword',
                fields: {
                  text: {
                    type: 'text',
                    norms: false,
                  },
                },
                ignore_above: 1024,
              },
            },
          },
        },
      },
      bytes: {
        type: 'long',
      },
      domain: {
        type: 'keyword',
        ignore_above: 1024,
      },
      geo: {
        properties: {
          city_name: {
            type: 'keyword',
            ignore_above: 1024,
          },
          continent_name: {
            type: 'keyword',
            ignore_above: 1024,
          },
          country_iso_code: {
            type: 'keyword',
            ignore_above: 1024,
          },
          country_name: {
            type: 'keyword',
            ignore_above: 1024,
          },
          location: {
            type: 'geo_point',
          },
          name: {
            type: 'keyword',
            ignore_above: 1024,
          },
          region_iso_code: {
            type: 'keyword',
            ignore_above: 1024,
          },
          region_name: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
      ip: {
        type: 'ip',
      },
      mac: {
        type: 'keyword',
        ignore_above: 1024,
      },
      nat: {
        properties: {
          ip: {
            type: 'ip',
          },
          port: {
            type: 'long',
          },
        },
      },
      packets: {
        type: 'long',
      },
      port: {
        type: 'long',
      },
      registered_domain: {
        type: 'keyword',
        ignore_above: 1024,
      },
      top_level_domain: {
        type: 'keyword',
        ignore_above: 1024,
      },
      user: {
        properties: {
          domain: {
            type: 'keyword',
            ignore_above: 1024,
          },
          email: {
            type: 'keyword',
            ignore_above: 1024,
          },
          full_name: {
            type: 'keyword',
            fields: {
              text: {
                type: 'text',
                norms: false,
              },
            },
            ignore_above: 1024,
          },
          group: {
            properties: {
              domain: {
                type: 'keyword',
                ignore_above: 1024,
              },
              id: {
                type: 'keyword',
                ignore_above: 1024,
              },
              name: {
                type: 'keyword',
                ignore_above: 1024,
              },
            },
          },
          hash: {
            type: 'keyword',
            ignore_above: 1024,
          },
          id: {
            type: 'keyword',
            ignore_above: 1024,
          },
          name: {
            type: 'keyword',
            fields: {
              text: {
                type: 'text',
                norms: false,
              },
            },
            ignore_above: 1024,
          },
        },
      },
    },
  },
  sourcemap: {
    dynamic: 'false',
    properties: {
      bundle_filepath: {
        type: 'keyword',
        ignore_above: 1024,
      },
      service: {
        properties: {
          name: {
            type: 'keyword',
            ignore_above: 1024,
          },
          version: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
    },
  },
  span: {
    dynamic: 'false',
    properties: {
      action: {
        type: 'keyword',
        ignore_above: 1024,
      },
      db: {
        dynamic: 'false',
        properties: {
          link: {
            type: 'keyword',
            ignore_above: 1024,
          },
          rows_affected: {
            type: 'long',
          },
        },
      },
      destination: {
        dynamic: 'false',
        properties: {
          service: {
            dynamic: 'false',
            properties: {
              name: {
                type: 'keyword',
                ignore_above: 1024,
              },
              resource: {
                type: 'keyword',
                ignore_above: 1024,
              },
              type: {
                type: 'keyword',
                ignore_above: 1024,
              },
            },
          },
        },
      },
      duration: {
        properties: {
          us: {
            type: 'long',
          },
        },
      },
      id: {
        type: 'keyword',
        ignore_above: 1024,
      },
      message: {
        dynamic: 'false',
        properties: {
          age: {
            properties: {
              ms: {
                type: 'long',
              },
            },
          },
          queue: {
            properties: {
              name: {
                type: 'keyword',
                ignore_above: 1024,
              },
            },
          },
        },
      },
      name: {
        type: 'keyword',
        ignore_above: 1024,
      },
      self_time: {
        properties: {
          count: {
            type: 'long',
          },
          sum: {
            properties: {
              us: {
                type: 'long',
              },
            },
          },
        },
      },
      start: {
        properties: {
          us: {
            type: 'long',
          },
        },
      },
      subtype: {
        type: 'keyword',
        ignore_above: 1024,
      },
      sync: {
        type: 'boolean',
      },
      type: {
        type: 'keyword',
        ignore_above: 1024,
      },
    },
  },
  system: {
    properties: {
      cpu: {
        properties: {
          total: {
            properties: {
              norm: {
                properties: {
                  pct: {
                    type: 'scaled_float',
                    scaling_factor: 1000.0,
                  },
                },
              },
            },
          },
        },
      },
      memory: {
        properties: {
          actual: {
            properties: {
              free: {
                type: 'long',
              },
            },
          },
          total: {
            type: 'long',
          },
        },
      },
      process: {
        properties: {
          cpu: {
            properties: {
              total: {
                properties: {
                  norm: {
                    properties: {
                      pct: {
                        type: 'scaled_float',
                        scaling_factor: 1000.0,
                      },
                    },
                  },
                },
              },
            },
          },
          memory: {
            properties: {
              rss: {
                properties: {
                  bytes: {
                    type: 'long',
                  },
                },
              },
              size: {
                type: 'long',
              },
            },
          },
        },
      },
    },
  },
  tags: {
    type: 'keyword',
    ignore_above: 1024,
  },
  threat: {
    properties: {
      framework: {
        type: 'keyword',
        ignore_above: 1024,
      },
      tactic: {
        properties: {
          id: {
            type: 'keyword',
            ignore_above: 1024,
          },
          name: {
            type: 'keyword',
            ignore_above: 1024,
          },
          reference: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
      technique: {
        properties: {
          id: {
            type: 'keyword',
            ignore_above: 1024,
          },
          name: {
            type: 'keyword',
            fields: {
              text: {
                type: 'text',
                norms: false,
              },
            },
            ignore_above: 1024,
          },
          reference: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
    },
  },
  timeseries: {
    properties: {
      instance: {
        type: 'keyword',
        ignore_above: 1024,
      },
    },
  },
  timestamp: {
    properties: {
      us: {
        type: 'long',
      },
    },
  },
  tls: {
    properties: {
      cipher: {
        type: 'keyword',
        ignore_above: 1024,
      },
      client: {
        properties: {
          certificate: {
            type: 'keyword',
            ignore_above: 1024,
          },
          certificate_chain: {
            type: 'keyword',
            ignore_above: 1024,
          },
          hash: {
            properties: {
              md5: {
                type: 'keyword',
                ignore_above: 1024,
              },
              sha1: {
                type: 'keyword',
                ignore_above: 1024,
              },
              sha256: {
                type: 'keyword',
                ignore_above: 1024,
              },
            },
          },
          issuer: {
            type: 'keyword',
            ignore_above: 1024,
          },
          ja3: {
            type: 'keyword',
            ignore_above: 1024,
          },
          not_after: {
            type: 'date',
          },
          not_before: {
            type: 'date',
          },
          server_name: {
            type: 'keyword',
            ignore_above: 1024,
          },
          subject: {
            type: 'keyword',
            ignore_above: 1024,
          },
          supported_ciphers: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
      curve: {
        type: 'keyword',
        ignore_above: 1024,
      },
      established: {
        type: 'boolean',
      },
      next_protocol: {
        type: 'keyword',
        ignore_above: 1024,
      },
      resumed: {
        type: 'boolean',
      },
      server: {
        properties: {
          certificate: {
            type: 'keyword',
            ignore_above: 1024,
          },
          certificate_chain: {
            type: 'keyword',
            ignore_above: 1024,
          },
          hash: {
            properties: {
              md5: {
                type: 'keyword',
                ignore_above: 1024,
              },
              sha1: {
                type: 'keyword',
                ignore_above: 1024,
              },
              sha256: {
                type: 'keyword',
                ignore_above: 1024,
              },
            },
          },
          issuer: {
            type: 'keyword',
            ignore_above: 1024,
          },
          ja3s: {
            type: 'keyword',
            ignore_above: 1024,
          },
          not_after: {
            type: 'date',
          },
          not_before: {
            type: 'date',
          },
          subject: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
      version: {
        type: 'keyword',
        ignore_above: 1024,
      },
      version_protocol: {
        type: 'keyword',
        ignore_above: 1024,
      },
    },
  },
  trace: {
    dynamic: 'false',
    properties: {
      id: {
        type: 'keyword',
        ignore_above: 1024,
      },
    },
  },
  tracing: {
    properties: {
      trace: {
        properties: {
          id: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
      transaction: {
        properties: {
          id: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
    },
  },
  transaction: {
    dynamic: 'false',
    properties: {
      breakdown: {
        properties: {
          count: {
            type: 'long',
          },
        },
      },
      duration: {
        properties: {
          count: {
            type: 'long',
          },
          sum: {
            properties: {
              us: {
                type: 'long',
              },
            },
          },
          us: {
            type: 'long',
          },
        },
      },
      id: {
        type: 'keyword',
        ignore_above: 1024,
      },
      marks: {
        dynamic: 'true',
        properties: {
          '*': {
            properties: {
              '*': {
                type: 'object',
                dynamic: 'true',
              },
            },
          },
          agent: {
            properties: {
              domComplete: {
                type: 'scaled_float',
                scaling_factor: 1000000.0,
              },
              domInteractive: {
                type: 'scaled_float',
                scaling_factor: 1000000.0,
              },
              firstContentfulPaint: {
                type: 'scaled_float',
                scaling_factor: 1000000.0,
              },
              timeToFirstByte: {
                type: 'scaled_float',
                scaling_factor: 1000000.0,
              },
            },
          },
          navigationTiming: {
            properties: {
              connectEnd: {
                type: 'scaled_float',
                scaling_factor: 1000000.0,
              },
              connectStart: {
                type: 'scaled_float',
                scaling_factor: 1000000.0,
              },
              domComplete: {
                type: 'scaled_float',
                scaling_factor: 1000000.0,
              },
              domContentLoadedEventEnd: {
                type: 'scaled_float',
                scaling_factor: 1000000.0,
              },
              domContentLoadedEventStart: {
                type: 'scaled_float',
                scaling_factor: 1000000.0,
              },
              domInteractive: {
                type: 'scaled_float',
                scaling_factor: 1000000.0,
              },
              domLoading: {
                type: 'scaled_float',
                scaling_factor: 1000000.0,
              },
              domainLookupEnd: {
                type: 'scaled_float',
                scaling_factor: 1000000.0,
              },
              domainLookupStart: {
                type: 'scaled_float',
                scaling_factor: 1000000.0,
              },
              fetchStart: {
                type: 'scaled_float',
                scaling_factor: 1000000.0,
              },
              loadEventEnd: {
                type: 'scaled_float',
                scaling_factor: 1000000.0,
              },
              loadEventStart: {
                type: 'scaled_float',
                scaling_factor: 1000000.0,
              },
              requestStart: {
                type: 'scaled_float',
                scaling_factor: 1000000.0,
              },
              responseEnd: {
                type: 'scaled_float',
                scaling_factor: 1000000.0,
              },
              responseStart: {
                type: 'scaled_float',
                scaling_factor: 1000000.0,
              },
            },
          },
        },
      },
      message: {
        dynamic: 'false',
        properties: {
          age: {
            properties: {
              ms: {
                type: 'long',
              },
            },
          },
          queue: {
            properties: {
              name: {
                type: 'keyword',
                ignore_above: 1024,
              },
            },
          },
        },
      },
      name: {
        type: 'keyword',
        fields: {
          text: {
            type: 'text',
            norms: false,
          },
        },
        ignore_above: 1024,
      },
      result: {
        type: 'keyword',
        ignore_above: 1024,
      },
      sampled: {
        type: 'boolean',
      },
      self_time: {
        properties: {
          count: {
            type: 'long',
          },
          sum: {
            properties: {
              us: {
                type: 'long',
              },
            },
          },
        },
      },
      span_count: {
        properties: {
          dropped: {
            type: 'long',
          },
        },
      },
      type: {
        type: 'keyword',
        ignore_above: 1024,
      },
    },
  },
  url: {
    dynamic: 'false',
    properties: {
      domain: {
        type: 'keyword',
        ignore_above: 1024,
      },
      extension: {
        type: 'keyword',
        ignore_above: 1024,
      },
      fragment: {
        type: 'keyword',
        ignore_above: 1024,
      },
      full: {
        type: 'keyword',
        ignore_above: 1024,
      },
      original: {
        type: 'keyword',
        fields: {
          text: {
            type: 'text',
            norms: false,
          },
        },
        ignore_above: 1024,
      },
      password: {
        type: 'keyword',
        ignore_above: 1024,
      },
      path: {
        type: 'keyword',
        ignore_above: 1024,
      },
      port: {
        type: 'long',
      },
      query: {
        type: 'keyword',
        ignore_above: 1024,
      },
      registered_domain: {
        type: 'keyword',
        ignore_above: 1024,
      },
      scheme: {
        type: 'keyword',
        ignore_above: 1024,
      },
      top_level_domain: {
        type: 'keyword',
        ignore_above: 1024,
      },
      username: {
        type: 'keyword',
        ignore_above: 1024,
      },
    },
  },
  user: {
    dynamic: 'false',
    properties: {
      domain: {
        type: 'keyword',
        ignore_above: 1024,
      },
      email: {
        type: 'keyword',
        ignore_above: 1024,
      },
      full_name: {
        type: 'keyword',
        fields: {
          text: {
            type: 'text',
            norms: false,
          },
        },
        ignore_above: 1024,
      },
      group: {
        properties: {
          domain: {
            type: 'keyword',
            ignore_above: 1024,
          },
          id: {
            type: 'keyword',
            ignore_above: 1024,
          },
          name: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
      hash: {
        type: 'keyword',
        ignore_above: 1024,
      },
      id: {
        type: 'keyword',
        ignore_above: 1024,
      },
      name: {
        type: 'keyword',
        ignore_above: 1024,
      },
    },
  },
  user_agent: {
    dynamic: 'false',
    properties: {
      device: {
        properties: {
          name: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
      name: {
        type: 'keyword',
        ignore_above: 1024,
      },
      original: {
        type: 'keyword',
        fields: {
          text: {
            type: 'text',
            norms: false,
          },
        },
        ignore_above: 1024,
      },
      os: {
        properties: {
          family: {
            type: 'keyword',
            ignore_above: 1024,
          },
          full: {
            type: 'keyword',
            ignore_above: 1024,
          },
          kernel: {
            type: 'keyword',
            ignore_above: 1024,
          },
          name: {
            type: 'keyword',
            ignore_above: 1024,
          },
          platform: {
            type: 'keyword',
            ignore_above: 1024,
          },
          version: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
      version: {
        type: 'keyword',
        ignore_above: 1024,
      },
    },
  },
  'view spans': {
    type: 'keyword',
    ignore_above: 1024,
  },
  vulnerability: {
    properties: {
      category: {
        type: 'keyword',
        ignore_above: 1024,
      },
      classification: {
        type: 'keyword',
        ignore_above: 1024,
      },
      description: {
        type: 'keyword',
        fields: {
          text: {
            type: 'text',
            norms: false,
          },
        },
        ignore_above: 1024,
      },
      enumeration: {
        type: 'keyword',
        ignore_above: 1024,
      },
      id: {
        type: 'keyword',
        ignore_above: 1024,
      },
      reference: {
        type: 'keyword',
        ignore_above: 1024,
      },
      report_id: {
        type: 'keyword',
        ignore_above: 1024,
      },
      scanner: {
        properties: {
          vendor: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
      score: {
        properties: {
          base: {
            type: 'float',
          },
          environmental: {
            type: 'float',
          },
          temporal: {
            type: 'float',
          },
          version: {
            type: 'keyword',
            ignore_above: 1024,
          },
        },
      },
      severity: {
        type: 'keyword',
        ignore_above: 1024,
      },
    },
  },
};

export const logsFieldMappings = {
  host: {
    properties: {
      name: {
        type: 'keyword',
        ignore_above: 1024,
      },
    },
  },
};
