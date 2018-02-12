Title: Kicking DnsControl Up a Notch with Typescript
Published: 2/11/18
Description: Improving "DNS as Code" with type checking and Intellisense
---

I love this new era of infrastructure as code being a DevOps developer. I can apply my knowledge of code, beyond just simple scripts and programs, to fully managing my infrastructure - all from the comfort of VSCode and Git.

My newest project is the revamping of DNS zones, hopefully moving them back to using code. Historically, I did manage them using code. In fact, I used `nsd` managed by SaltStack (zones automatically created from YAML). This worked for me for years - but I was never really happy with it. My custom templates were fragile and my deployments would randomly break. I ended up switching my primary domains over to other hosted DNS providers because I needed the reliability. Throughout the years, I actually went through a bunch of providers:

- Amazon Route53
- DNSimple
- DNSMadeEasy
- CloudFlare
- DigitalOcean
- Afraid DNS
- Hurricane Electric (Yes, they provide free DNS services)

Oh, yeah, did I mention I have 32 domains? Needless to say my DNS infrastructure was fragmented - that is until I found DnsControl. 

## DnsControl

DnsControl saved my sanity - as simple as that. Using DnsControl I could create zones in a portable format and synchronize with the different DNS providers I used (almost all of them, I don't have enough golang knowledge to implement a DNSMadeEasy provider). [Craig Peterson](https://blog.serverfault.com/2017/04/11/introducing-dnscontrol-dns-as-code-has-arrived/) calls it "describe once, use anywhere".

So I went reading though the docs preparing to make the switch and I got worried -the docs kept on talking about this custom DSL that was created for DnsControl. I for one hate custom configuration types since I effectively lose IDE support. They called it a Javascript like language - which got me thinking, if I was a lazy developer (which I am), I wouldn't create a custom language if I could piggyback off an existing one. Is this Javascript-like-DSL actually Javascript? 

Yes, it turns out that DnsControl is running a golang Javascript runtime internally with custom global functions. This discovery just opened a huge amount of possibilities, what limits could I push with this DSL? After looking a bit further throughout the code I discovered that basically ES5 was supported, with basic module loading support (some might call it a hacked). This didn't worry me so much as I had my sights on something bigger - could I get Webpack to work with this?

## Webpack + Typescript

Yes, it turns out DnsControl had enough ES5 compatibility for Webpack to do it's magic. This of course ment my next logical step had to be to try Typescript, which worked (of course the definitions for the custom DSL didn't exist, more on that later).

Below is my rather standard `webpack.config.js` configuration. I'm also having Webpack manage the `creds.json` file too, for convenience sake.

```file-webpack.config.js
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: "./src/main.ts",
    output: {
        path: path.resolve("./output"),
        filename: "dnsconfig.js"
    },
    resolve: {
        extensions: [".ts", ".js"],
        modules: ["src", "node_modules"].map(x => path.resolve(x)),
    },
    module: {
        loaders: [
            {
                test: /\.ts$/,
                use: [
                    'babel-loader',
                    'ts-loader'
                ],
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin([
            {
                from: "./src/creds.json",
                to: "./creds.json"
            }
        ])
    ]
}
```

I also added some babel-env support (to auto-polyfill ES6 type support, e.g. `Map`):

```file-.babelrc
{
    "presets": [
        [
            "@babel/preset-env",
            {
                "useBuiltIns": "usage",
                "module": false
            }
        ]
    ]
}
```

Of course my next step was to make some type definitions for the custom DSL methods. This one actually took some effort as some of the DSL methods were missing from the documentation (at the time of my search). I eventually just went through the code to find these methods (and their signatures) that I needed. Below are the definitions that I compiled:

```file-global.d.ts
// Version 1
// https://stackexchange.github.io/dnscontrol/js
type Ttl = string | number;

// Top Level Functions
declare function REV(address: string): string;
declare function NewRegistrar(name: string, type: string, meta?: any): string;
declare function NewDnsProvider(name: string, type: string, meta?: any): string;
declare function DEFAULTS(...modifiers: any[]): void;
declare function D(name: string, registrar: string, ...meta: any[]): void;

// Domain Modifiers
declare function A(name: string, address: string, ...modifiers: any[]);
declare function AAAA(name: string, address: string, ...modifiers: any[]);
declare function ALIAS(name: string, target: string, ...modifiers: any[]);
declare function CAA(name: string, tag: string, value: string, ...modifiers: any[]);
declare function CNAME(name: string, target: string, ...modifiers: any[]);
declare function DefaultTTL(ttl: Ttl);
declare function DnsProvider(name: string, nsCount?: number);
declare function MX(name: string, priority: number, target: string, ...modifiers: any[]);
declare function NAMESERVER(name: string, ip?: string, ...modifiers: any[]);
declare function NO_PURGE();
declare function NS(name: string, target: string, ...modifiers: any[]);
declare function PTR(name: string, target: string, ...modifiers: any[]);
declare function NO_PURGE();
declare function TLSA(name: string, usage: number, selector: number, type: number, certificate: string, ...modifiers: any[]);
declare function TXT(name: string, contents: string, ...modifiers: any[]);

declare function SRV(name: string, priority: number, weight: number, port: number, target: string, ...modifiers: any[]);

// Record Modifiers
declare function TTL(ttl: Ttl);
```

## The Result

With this simple setup I got access to a bunch of neat little features. The options are limitless! Here are a couple of perks I personally loved:

### Typescript

Auto-completion support:

![Auto-complete support](/content/images/2018/dnscontrol-auto-complete.png)

Type-checking support:

![Type-checking support](/content/images/2018/dnscontrol-type-checking.png)

Module support + static analysis:

![Module support](/content/images/2018/dnscontrol-module-support.png)

And of couse linting:

![Linting support](/content/images/2018/dnscontrol-linting.png)

Although, to be honest, being able to use Typescript instead of ES5 is always going to make me happy.

### Webpack

Now that I also had Webpack support I could do some more advance things like `require.context`. This means I could bypass DnsControl's rudimentary module loading support in favor of dynamic loading of entire directories. For example:

```file-main.ts
let context = require.context("./zones/", true, /\.ts$/);

context.keys().forEach((zone: string) => {
    console.log(`Loading ${zone}.`);
    context(zone);
});
```

This code basically allows me to place all my zones into the `zone` folder to be dynamically loaded into DnsControl during "compilation" - which is awesome!

## Summary

DnsControl has this line in their docs:

> Editing zone files is error-prone.

Well, IMHO, writing Javascript is error prone - use Typescript!

