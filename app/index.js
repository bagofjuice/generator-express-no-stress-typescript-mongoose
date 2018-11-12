'use strict';

const Generator = require('yeoman-generator');
const path = require('path');

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.argument('appname', { type: String, required: false });
    this.option('yarn', {
      description: 'Use Yarn as the package manager',
    });
    this.option('docker', {
      description: 'Install Docker artifacts including a Dockerfile',
    });

    this.useYarn = this.options.yarn;
    this.docker = this.options.docker;
    this.name = this.options.appname || 'myapp';
    this.description = 'My cool Mongo, Typescript, Express app';
    this.version = '1.0.0';
    this.apiRoot = '/api/v1';
  }

  initializing() {}

  prompting() {
    const prompts = [
      {
        type: 'input',
        name: 'description',
        message: `App description [${this.description}]`,
      },
      {
        type: 'input',
        name: 'apiRoot',
        message: `API Root [${this.apiRoot}]`,
      },
      {
        type: 'input',
        name: 'apiVersion',
        message: `Version [${this.version}]`,
      },
    ];

    if (!this.options.appname) {
      prompts.unshift({
        type: 'input',
        name: 'name',
        message: `App name [${this.name}]`,
      });
    }

    return this.prompt(prompts).then(r => {
      this.name = r.name ? r.name : this.name;
      this.description = r.description ? r.description : this.description;
      this.version = r.version ? r.version : this.version;
      this.apiRoot = r.apiRoot ? r.apiRoot.replace(/^\/?/, '/') : this.apiRoot;
    });
  }

  configuring() {}

  default() {}

  get writing() {
    return {
      appStaticFiles() {
        const src = this.sourceRoot();
        const dest = this.destinationPath(this.name);

        const files = [
          'package.json',
          'README.md',
          'server/routes.ts',
          '.env',
          'test/examples.controller.ts',
          'server/common/swagger/Api.yaml',
          'public/api-explorer/index.html',
          'public/api-explorer/swagger-ui-standalone-preset.js',
          'public/index.html',
          'gitignore',
        ];

        const copyOpts = this.docker
          ? null
          : {
              globOptions: {
                ignore: ['**/+(Dockerfile|.dockerignore)'],
              },
            };
        this.fs.copy(src, dest, copyOpts);
        this.fs.copy(this.templatePath('.*'), dest, copyOpts);

        const opts = {
          name: this.name,
          title: this.name,
          description: this.description,
          version: this.version,
          apiRoot: this.apiRoot,
        };

        files.forEach(f => {
          this.fs.copyTpl(
            this.templatePath(f),
            this.destinationPath(`${this.name}/${f}`),
            opts
          );
        });

        this.fs.move(
          this.destinationPath(`${this.name}`, 'gitignore'),
          this.destinationPath(`${this.name}`, '.gitignore')
        );
      },
    };
  }

  conflicts() {}

  install() {
    const appDir = path.join(process.cwd(), this.name);
    process.chdir(appDir);
    if (this.useYarn) {
      this.yarnInstall();
    } else {
      this.npmInstall();
    }
  }

  end() {}
};
