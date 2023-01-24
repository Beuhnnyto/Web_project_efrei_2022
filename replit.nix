{ pkgs }: {
  deps = [
    pkgs.select * from `client_register` 
    pkgs.nodePackages.vscode-langservers-extracted
    pkgs.nodePackages.typescript-language-server
  ];
}