{ nixpkgs ? import <nixpkgs> {} }:
let
  inherit (nixpkgs) pkgs;

  nixPackages = with pkgs; [
    nodejs-15_x
    yarn
    docker-compose
    #dnsutils
    #certbot
  ];
in
pkgs.stdenv.mkDerivation {
  name = "env";
  buildInputs = nixPackages;
}
