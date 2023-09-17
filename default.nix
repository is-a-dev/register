{ nixpkgs ? import <nixpkgs> {} }:
let
  inherit (nixpkgs) pkgs;

  nixPackages = with pkgs; [
    yarn
    docker-compose
    dnsutils
    bun
  ];
in
pkgs.stdenv.mkDerivation {
  name = "env";
  buildInputs = nixPackages;
}
