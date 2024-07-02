---
tags:
  - posts
  - cheatsheet
  - helm
title: How I use Helm with GitOps
description: How I integrate Helm into a Kubernetes GitOps flow.
---
## Short Introduction

All my Kubernetes clusters follow [GitOps](https://argo-cd.readthedocs.io/en/stable/) principles, so [Helm](https://helm.sh/) is always a little wonky. Helm has side-effects that aren't easily version controlled, although, this is debatable, if you consider Helm a [black box](https://en.wikipedia.org/wiki/Black_box). For my personal sanity, I typically output Helm's manifests into my Git-versioned repository so I can use all the standard Git-tooling, e.g. diffs and history. Yes, many GitOps operators do natively support Helm, but they typically do the same exact steps as I would, just on demand (which, IMO, hides too much of what's happening), but I see how it would be good for some.

## Helm Chart Setup

> This example is setting up [Verdaccio](https://verdaccio.org/) in my public cluster, I just happen to be setting it up when I thought this could be a blog topic.

I consider Helm repositories transient in nature, so out-of-scope from a GitOps perspective. So I just assume all operators are installing Helm and adding the relevant repositories. I typically place a `README.md` in each Helm deployment (I personally call them workloads).

> I typically only use Linux for Kubernetes interactions - so [WSL](https://en.wikipedia.org/wiki/Windows_Subsystem_for_Linux) when I'm on Windows.

```bash
helm repo add verdaccio https://charts.verdaccio.org
helm repo update
```

Then I can interrogate the repository.

First I do a repository search, this is mostly so I can get the version of the chart (for reproducibility). Sometimes the app version is important, it really depends on the project. Some projects decouple the chat manifests from the actual deployed application (so new app versions can be deployed independently), other projects consider the Helm chart as an app deliverable - so both are deeply coupled. Both strategies are fine, they have different pro's/con's - at least for the Helm operator.

```bash
helm search repo verdaccio
```

```plaintext
NAME                    CHART VERSION   APP VERSION     DESCRIPTION
verdaccio/verdaccio     4.17.0          5.31.1          A lightweight private node.js proxy registry
```

I also dump the `values.yaml` from the chart.

```bash
helm show values verdaccio/verdaccio > src/workloads/apps/verdaccio/values.yaml
```

I've continue to experiment here. Best-practices dictate that you only specify the values you want to override, and allow the defaults to be defined by the chart - to reduce the amount of noise when a human operator reads the file. Basically, it helps the Git-diffs stay manageable. The downside here is that you depend on project documentation to know when something you aren't tracking, may need to be changed.

So I think it depends on the chart. For workloads I really care about - say, `keycloak` or `consul-sync`, I want to know when new options are available and if any defaults change - even if that means I need to manually convert from on chart `values.yaml` to another (say, when a lot of things get moved around). Being able to Git-diff between chart values is powerful. Some projects though, don't specify their defaults in the `values.yaml`, but in the templates themselves - so not a perfect solution either.

## Tangent: Kustomize

I should mention that I use `kustomize` in my GitOps flow, mostly so I can:

1. Apply non-destructive patches on "[vendored](https://stackoverflow.com/questions/26217488/what-is-vendoring) components" (so anything I take directly from a project), e.g. Helm charts. This helps maintainability and indirectly adds a level of "self-documentation".
2. Git-diff changes separating from any customizations, e.g. custom labels/annotations, replicas, etc. This offers greater control that I'm used to when writing actual code.

Some things I just don't want the Helm chart to generate, mostly secrets. I like to store encrypted-secrets in the Git-repository itself (e.g. using [`sealed-secrets`](https://github.com/bitnami-labs/sealed-secrets)) - so secret changes can also be tracked/audited. Of course, this is also a "it depends" situation - a secret vault offers a lot of features that might be preferred (e.g. auto-key-rotation, better access control, etc.).

With that tangent over, back to Helm.

## Generating the Manifests

So after I've authored the `values` I care about, I can generate the Kubernetes manifests.

There's a couple options here, but this is what I normally reach for:

```bash
helm template verdaccio verdaccio/verdaccio \
  --version 4.17.0 \
  --namespace apps-verdaccio \
  --no-hooks \
  --values src/workloads/apps/verdaccio/values.yaml \
  > src/workloads/apps/verdaccio/base/install.yaml
```

The Helm `template` verb seems mostly for testing, but it works wonderfully here. My input is the authored `values.yaml` file and the output is a single YAML file containing all the manifests concatenated together using YAML's multi-document syntax. I explicitly specify a namespace as not every manifest type can be correctly updated by `kustomize` (using Kustomize's native "namespace" feature) - for example, if the chart doesn't dynamically use the [Downward API](https://kubernetes.io/docs/concepts/workloads/pods/downward-api/) to get the Kubernetes deployment context (this was a problem for years with the `nginx-ingress` project).

I also use the `--no-hooks` flag to avoid introducing any Helm side-effects/wonkiness into the non-Helm deployment. It really depends on the project, and how the Helm hooks are used.

There's some flags that might be useful, but as with everything else, pro's/con's of different approaches - it should be operator discretion (as everything should be).

`--create-namespace`: Does what it says. Sometimes a good thing, sometimes not needed (the GitOps tool may automatically create namespaces), and sometimes harmful (e.g. if multiple apps are deployed into the same namespace, or if the namespace has access restrictions).

`--include-crds`: Also does what it says. This is useful for installing operators - so the CRD's are version controlled. Another, "it depends", for example, if you are using different versions of the same operator across different namespaces.

`--output-dir`: Instead of piping the manifests to a YAML file, Helm can directly create files, one-file-per-manifest. This is useful for more complex deployments (e.g. operators with many CRD's), but can make manageability harder (each file needs to be defined in the `kustomization.yaml`).

## Kustomize and Patches

So at this point, I have three files in version control:

- `values.yaml`: Values used for templating.
- `base/install.yaml`: All the chat's manifests.
- `README.md`: For the sanity of anyone needing to change/update this deployment.

So now it's time to create a `kustomization.yaml` file:

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: apps-verdaccio
resources:
- base/install.yaml
```

Of course, at this point I can apply [Kustomize patches](https://github.com/kubernetes-sigs/kustomize?tab=readme-ov-file#2-create-variants-using-overlays). Thankfully, Verdaccio's chart is well designed, so I don't have a need to make any patches - but this is another reason I like to template Helm charts, instead of allowing another cluster-tool to generate the manifests on-demand. When I can see the manifests, it's easier to make patches (and run them locally to test).

---

And that's about it, these manifests can be now be referenced in whatever way your GitOps tooling expects (e.g. for ArgoCD, an `Application` manifest).
