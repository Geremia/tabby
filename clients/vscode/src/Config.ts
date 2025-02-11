import { EventEmitter } from "events";
import { workspace, ExtensionContext, WorkspaceConfiguration, ConfigurationTarget, Memento } from "vscode";
import { State as LanguageClientState } from "vscode-languageclient";
import { ClientProvidedConfig, ServerConfig } from "tabby-agent";
import { Client } from "./lsp/Client";

export class Config extends EventEmitter {
  private serverConfig?: ServerConfig;

  constructor(
    private readonly context: ExtensionContext,
    private readonly client: Client,
  ) {
    super();
    this.client.languageClient.onDidChangeState(async (state) => {
      if (state.newState === LanguageClientState.Running) {
        this.serverConfig = await this.client.agent.fetchServerConfig();
        this.emit("updatedServerConfig");
      }
    });
    this.client.agent.on("didChangeServerConfig", (params: ServerConfig) => {
      this.serverConfig = params;
      this.emit("updatedServerConfig");
    });
    context.subscriptions.push(
      workspace.onDidChangeConfiguration(async (event) => {
        if (event.affectsConfiguration("tabby")) {
          this.emit("updated");
        }
      }),
    );
  }

  get workspace(): WorkspaceConfiguration {
    return workspace.getConfiguration("tabby");
  }

  get memento(): Memento {
    return this.context.globalState;
  }

  get server(): ServerConfig {
    return (
      this.serverConfig ?? {
        endpoint: this.serverEndpoint,
        token: this.serverToken,
        requestHeaders: null,
      }
    );
  }

  get serverEndpoint(): string {
    return this.workspace.get("api.endpoint", "");
  }

  set serverEndpoint(value: string) {
    if (value !== this.serverEndpoint) {
      this.workspace.update("api.endpoint", value, ConfigurationTarget.Global);
    }
  }

  get serverToken(): string {
    return this.memento.get("server.token", "");
  }

  set serverToken(value: string) {
    if (value !== this.serverToken) {
      this.memento.update("server.token", value);
      this.emit("updated");
    }
  }

  get inlineCompletionTriggerMode(): "automatic" | "manual" {
    return this.workspace.get("inlineCompletion.triggerMode", "automatic");
  }

  set inlineCompletionTriggerMode(value: "automatic" | "manual") {
    if (value !== this.inlineCompletionTriggerMode) {
      this.workspace.update("inlineCompletion.triggerMode", value, ConfigurationTarget.Global);
    }
  }

  get inlineCompletionEnabled(): boolean {
    return workspace.getConfiguration("editor").get("inlineSuggest.enabled", true);
  }

  set inlineCompletionEnabled(value: boolean) {
    if (value !== this.inlineCompletionEnabled) {
      workspace.getConfiguration("editor").update("inlineSuggest.enabled", value, ConfigurationTarget.Global);
    }
  }

  get keybindings(): "vscode-style" | "tabby-style" {
    return this.workspace.get("keybindings", "vscode-style");
  }

  get anonymousUsageTrackingDisabled(): boolean {
    return this.workspace.get("usage.anonymousUsageTracking", false);
  }

  get mutedNotifications(): string[] {
    return this.memento.get("notifications.muted", []);
  }

  set mutedNotifications(value: string[]) {
    this.memento.update("notifications.muted", value);
    this.emit("updated");
  }

  buildClientProvidedConfig(): ClientProvidedConfig {
    return {
      server: {
        endpoint: this.serverEndpoint,
        token: this.serverToken,
      },
      inlineCompletion: {
        triggerMode: this.inlineCompletionTriggerMode == "automatic" ? "auto" : "manual",
      },
      keybindings: this.keybindings == "tabby-style" ? "tabby-style" : "default",
      anonymousUsageTracking: {
        disable: this.anonymousUsageTrackingDisabled,
      },
    };
  }
}
