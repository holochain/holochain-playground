{
  description = "Template for Holochain app development";

  inputs = {
    holonix.url = "github:holochain/holonix/main-0.6";

    nixpkgs.follows = "holonix/nixpkgs";
  };

  outputs = inputs@{ ... }:
    inputs.holonix.inputs.flake-parts.lib.mkFlake { inherit inputs; } {
      systems = builtins.attrNames inputs.holonix.devShells;
      perSystem = { config, pkgs, system, inputs', lib, ... }: rec {
        devShells.default = pkgs.mkShell {
          inputsFrom = [ inputs.holonix.devShells.${system}.default ];
          packages = [
            pkgs.pnpm
            pkgs.nodejs_22
          ];
        };

        packages.hc-playground = let
          cliDist = pkgs.stdenv.mkDerivation (finalAttrs: {
            version = "0.500.0";
            pname = "hc-playground";
            src = (inputs.scaffolding.outputs.lib.cleanPnpmDepsSource {
              inherit lib;
            }) ./.;

            nativeBuildInputs = [ pkgs.nodejs pkgs.pnpm.configHook ];
            pnpmDeps = pkgs.pnpm.fetchDeps {
              inherit (finalAttrs) version pname src;
              fetcherVersion = 1;
              hash = "sha256-T0SufVzwiCumHXJzzbR4PSsUO8OkFQ2EjBp1qzxR/oI=";
            };
            buildPhase = ''
              runHook preBuild

              pnpm build:cli

              runHook postBuild
              mkdir $out
              cp -R packages/cli/server/dist $out
            '';
          });
        in pkgs.writeShellScriptBin "hc-playground" ''
          ${pkgs.nodejs_22}/bin/node ${cliDist}/dist/app.js "$@"
        '';
        apps.default.program = pkgs.writeShellApplication {
          name = "hc-playground";
          runtimeInputs = [ packages.hc-playground ];
          text = ''
            hc-playground "$@"
          '';
          meta.mainProgram = "hc-playground";
        };
      };
    };
}
