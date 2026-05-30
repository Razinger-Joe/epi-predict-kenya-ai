{{/*
═══════════════════════════════════════════════════════════════════════════════
EpiPredict Kenya AI — Helm Template Helpers
═══════════════════════════════════════════════════════════════════════════════
These are reusable template snippets that other templates call with "include".
Think of them as utility functions for your Kubernetes YAML.
═══════════════════════════════════════════════════════════════════════════════
*/}}

{{/*
Chart name — used as a base for all resource names.
*/}}
{{- define "epipredict.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Fully qualified app name — includes the release name for uniqueness.
If the release name already contains the chart name, don't duplicate it.
*/}}
{{- define "epipredict.fullname" -}}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}

{{/*
Standard labels applied to EVERY resource.
These follow Kubernetes recommended label conventions:
  - app.kubernetes.io/name: What application is this?
  - app.kubernetes.io/instance: Which installation of the app?
  - app.kubernetes.io/version: What version of the app?
  - app.kubernetes.io/managed-by: What tool manages this?
  - helm.sh/chart: Which Helm chart version?
*/}}
{{- define "epipredict.labels" -}}
helm.sh/chart: {{ include "epipredict.chart" . }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/part-of: epipredict
{{- end }}

{{/*
Selector labels — a SUBSET of labels used in spec.selector.matchLabels.
IMPORTANT: Selector labels are IMMUTABLE after creation. Only include
labels that will never change between upgrades.
*/}}
{{- define "epipredict.selectorLabels" -}}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Chart label — combines chart name and version for tracking.
*/}}
{{- define "epipredict.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Namespace helper — returns the configured namespace.
*/}}
{{- define "epipredict.namespace" -}}
{{- .Values.global.namespace | default "epipredict" }}
{{- end }}

{{/*
Database connection URL — constructed from secrets values.
Used by backend to connect to PostgreSQL.
*/}}
{{- define "epipredict.databaseUrl" -}}
{{- printf "postgresql://%s:%s@%s-database:%d/%s" .Values.secrets.database.user .Values.secrets.database.password (include "epipredict.fullname" .) (.Values.database.port | int) .Values.secrets.database.name }}
{{- end }}

{{/*
ML Service URL — constructed from service name and port.
Used by backend to call the ML microservice.
*/}}
{{- define "epipredict.mlServiceUrl" -}}
{{- printf "http://%s-ml-service:%d" (include "epipredict.fullname" .) (.Values.mlService.port | int) }}
{{- end }}

{{/*
Secret name — consistent naming for the database secret.
*/}}
{{- define "epipredict.secretName" -}}
{{- printf "%s-secrets" (include "epipredict.fullname" .) }}
{{- end }}
