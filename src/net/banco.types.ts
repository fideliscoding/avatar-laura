// Tipos gerados a partir do schema public aplicado no projeto Avatar Laura.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Versão do PostgREST usada para inferir as opções do cliente.
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      avatars: {
        Row: {
          atualizado_em: string
          cabelo: string
          criado_em: string
          extras: Json
          id: string
          nome: string
          principal: boolean
          roupa: string
          user_id: string
        }
        Insert: {
          atualizado_em?: string
          cabelo?: string
          criado_em?: string
          extras?: Json
          id?: string
          nome?: string
          principal?: boolean
          roupa?: string
          user_id: string
        }
        Update: {
          atualizado_em?: string
          cabelo?: string
          criado_em?: string
          extras?: Json
          id?: string
          nome?: string
          principal?: boolean
          roupa?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "avatars_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          ativa: boolean
          criado_em: string
          id: string
          lugar: string
          ordem: number
          recompensa_moedas: number
          requer_confirmacao_responsavel: boolean
          titulo: string
          valor: string
        }
        Insert: {
          ativa?: boolean
          criado_em?: string
          id: string
          lugar?: string
          ordem?: number
          recompensa_moedas?: number
          requer_confirmacao_responsavel?: boolean
          titulo: string
          valor: string
        }
        Update: {
          ativa?: boolean
          criado_em?: string
          id?: string
          lugar?: string
          ordem?: number
          recompensa_moedas?: number
          requer_confirmacao_responsavel?: boolean
          titulo?: string
          valor?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          apelido: string
          atualizado_em: string
          criado_em: string
          id: string
          moedas: number
          papel: string
          responsavel_id: string | null
        }
        Insert: {
          apelido?: string
          atualizado_em?: string
          criado_em?: string
          id: string
          moedas?: number
          papel?: string
          responsavel_id?: string | null
        }
        Update: {
          apelido?: string
          atualizado_em?: string
          criado_em?: string
          id?: string
          moedas?: number
          papel?: string
          responsavel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      progress: {
        Row: {
          atualizado_em: string
          concluida_em: string | null
          escolhas: Json
          mission_id: string
          status: string
          user_id: string
        }
        Insert: {
          atualizado_em?: string
          concluida_em?: string | null
          escolhas?: Json
          mission_id: string
          status?: string
          user_id: string
        }
        Update: {
          atualizado_em?: string
          concluida_em?: string | null
          escolhas?: Json
          mission_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      room_members: {
        Row: {
          aprovado: boolean
          entrou_em: string
          room_id: string
          user_id: string
        }
        Insert: {
          aprovado?: boolean
          entrou_em?: string
          room_id: string
          user_id: string
        }
        Update: {
          aprovado?: boolean
          entrou_em?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_members_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          ativa: boolean
          codigo: string
          criado_em: string
          dono_id: string
          id: string
          versao: number
        }
        Insert: {
          ativa?: boolean
          codigo: string
          criado_em?: string
          dono_id: string
          id?: string
          versao?: number
        }
        Update: {
          ativa?: boolean
          codigo?: string
          criado_em?: string
          dono_id?: string
          id?: string
          versao?: number
        }
        Relationships: [
          {
            foreignKeyName: "rooms_dono_id_fkey"
            columns: ["dono_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apelido_valido: { Args: { p_apelido: string }; Returns: boolean }
      aprovar_membro: {
        Args: { p_sala: string; p_usuario: string }
        Returns: undefined
      }
      concluir_missao: {
        Args: { p_escolhas?: Json; p_mission_id: string }
        Returns: number
      }
      consultar_sala: {
        Args: { p_sala: string }
        Returns: {
          ativa: boolean
          codigo: string
          criado_em: string
          dono_id: string
          id: string
          versao: number
        }
        SetofOptions: {
          from: "*"
          to: "rooms"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      criar_sala: {
        Args: never
        Returns: {
          ativa: boolean
          codigo: string
          criado_em: string
          dono_id: string
          id: string
          versao: number
        }
        SetofOptions: {
          from: "*"
          to: "rooms"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      entrar_na_sala: {
        Args: { p_codigo: string }
        Returns: {
          ativa: boolean
          codigo: string
          criado_em: string
          dono_id: string
          id: string
          versao: number
        }
        SetofOptions: {
          from: "*"
          to: "rooms"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      listar_membros_sala: {
        Args: { p_sala: string }
        Returns: {
          apelido: string
          aprovado: boolean
          cabelo: string
          user_id: string
        }[]
      }
      sair_da_sala: { Args: { p_sala: string }; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
