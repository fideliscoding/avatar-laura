export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
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
      casa_catalogo: {
        Row: {
          id: string
          inicial: Json
        }
        Insert: {
          id: string
          inicial: Json
        }
        Update: {
          id?: string
          inicial?: Json
        }
        Relationships: []
      }
      missions: {
        Row: {
          ativa: boolean
          criado_em: string
          definicao: Json | null
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
          definicao?: Json | null
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
          definicao?: Json | null
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
      objetos_estado: {
        Row: {
          atualizado_em: string
          dono: string
          estado: Json
          lugar: string
          objeto_id: string
          versao: number
        }
        Insert: {
          atualizado_em?: string
          dono: string
          estado: Json
          lugar: string
          objeto_id: string
          versao?: number
        }
        Update: {
          atualizado_em?: string
          dono?: string
          estado?: Json
          lugar?: string
          objeto_id?: string
          versao?: number
        }
        Relationships: [
          {
            foreignKeyName: "objetos_estado_dono_fkey"
            columns: ["dono"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          apelido: string
          atualizado_em: string
          criado_em: string
          id: string
          inventario: Json
          moedas: number
          papel: string
          responsavel_id: string | null
        }
        Insert: {
          apelido?: string
          atualizado_em?: string
          criado_em?: string
          id: string
          inventario?: Json
          moedas?: number
          papel?: string
          responsavel_id?: string | null
        }
        Update: {
          apelido?: string
          atualizado_em?: string
          criado_em?: string
          id?: string
          inventario?: Json
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
      guardar_objetos: {
        Args: { p_estados: Json; p_lugar: string }
        Returns: Json
      }
      ler_objetos: { Args: { p_dono: string; p_lugar: string }; Returns: Json }
      listar_membros_sala: {
        Args: { p_sala: string }
        Returns: {
          apelido: string
          aprovado: boolean
          cabelo: string
          user_id: string
        }[]
      }
      recompensar_casa: {
        Args: { p_dono: string; p_evento: string }
        Returns: Json
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
