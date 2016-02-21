{
  "targets": [
    {
      "target_name": "libpiano",
      "sources": [
        "src/libpiano/crypt.c",
        "src/libpiano/piano.c",
        "src/libpiano/request.c",
        "src/libpiano/response.c",
        "src/libpiano/list.c",
        ]
    },
    {
      "target_name": "pianobar",
        "include_dirs": [
            "/usr/include/json-c",
        ],
      "sources": [
        "src/main.c",
        "src/player.c",
        "src/settings.c",
        "src/terminal.c",
        "src/ui_act.c",
        "src/ui.c",
        "src/ui_readline.c",
        "src/ui_dispatch.c",
        ]
    }
  ]
}